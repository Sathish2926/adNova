import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; 
import upload from "../config/multerConfig.js"; // Requires server/config/multerConfig.js
import fs from "fs"; // Used for deleting files if upload fails

const router = express.Router();

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profileData = {};
        if (role === "business") {
            profileData.businessProfile = {};
        } else if (role === "influencer") {
            profileData.influencerProfile = {};
        }
        
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            ...profileData, 
            isProfileComplete: false
        });
        
        await user.save();

        res.json({ 
            success: true, 
            message: "User registered! Please complete your profile.", 
            role: user.role,
            isProfileComplete: user.isProfileComplete,
            userId: user._id // Returning the new MongoDB ID
        });
        
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ success: false, message: "Signup failed due to server error." });
    }
});

// --- LOGIN ROUTE (FIXED to return userId) ---
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        res.json({ 
            success: true, 
            role: user.role,
            isProfileComplete: user.isProfileComplete,
            userId: user._id // CRITICAL FIX: Returning the real MongoDB ID
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- PROFILE UPDATE ROUTE ---
router.post("/update-profile", async (req, res) => {
    try {
        const { userId, role, profileData } = req.body;
        
        let updateQuery = {};
        
        if (role === 'business') {
            updateQuery = { $set: { businessProfile: profileData, isProfileComplete: true } };
        } else if (role === 'influencer') {
            updateQuery = { $set: { influencerProfile: profileData, isProfileComplete: true } };
        } else {
            return res.status(400).json({ success: false, message: "Invalid user role." });
        }

        // Use findByIdAndUpdate which requires a valid ObjectId (now fixed via login route)
        const user = await User.findByIdAndUpdate(userId, updateQuery, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ 
            success: true, 
            message: "Profile saved and complete!", 
            role: user.role,
            isProfileComplete: user.isProfileComplete 
        });

    } catch (err) {
        console.error("Profile Update Error (Mongoose Details):", err); // Log the full error object
        
        let errorMessage = "Failed to update profile.";
        
        // Check for specific Mongoose Validation Errors
        if (err.name === 'ValidationError') {
            // Extracts the message for the first field that failed validation
            const firstError = Object.values(err.errors)[0];
            errorMessage = `Validation failed for ${firstError.path}: ${firstError.message}`;
        } else if (err.name === 'CastError') {
             errorMessage = `Data Type Error: Invalid value for field ${err.path}.`;
        }

        res.status(500).json({ success: false, message: errorMessage });
    }
});

// --- FILE UPLOAD ROUTE (requires fs import) ---
router.post("/upload-image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const { userId, fieldName, role } = req.body; 
        
        if (!userId || !fieldName || !role) {
            fs.unlinkSync(req.file.path); // Delete file if data is missing
            return res.status(400).json({ success: false, message: "Missing required profile data." });
        }
        
        const fileUrl = `/uploads/${req.file.filename}`;
        
        let updatePath = '';
        if (role === 'business') {
            updatePath = `businessProfile.${fieldName}`; 
        } else if (role === 'influencer') {
            updatePath = `influencerProfile.${fieldName}`; 
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { $set: { [updatePath]: fileUrl } }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Image uploaded successfully!", fileUrl: fileUrl });

    } catch (err) {
        console.error("Image Upload Error:", err);
        res.status(500).json({ success: false, message: "Failed to upload image." });
    }
});
router.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find the user by ID and prevent password from being returned
        // The .select('-password') ensures security.
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        // Successfully fetched data—send the entire user document
        res.json({ success: true, user: user });

    } catch (err) {
        // This is the error we were debugging earlier—it handles invalid IDs
        console.error("Fetch Profile Error:", err);
        return res.status(500).json({ success: false, message: "Server crash during fetch." });
    }
});

export default router;