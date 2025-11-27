import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; 
import upload from "../config/multerConfig.js"; 
import fs from "fs"; 

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
            userId: user._id 
        });
        
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ success: false, message: "Signup failed due to server error." });
    }
});

// --- LOGIN ROUTE ---
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
            userId: user._id,
            name: user.name, 
            email: user.email
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
        console.error("Profile Update Error:", err);
        let errorMessage = "Failed to update profile.";
        if (err.name === 'ValidationError') {
            const firstError = Object.values(err.errors)[0];
            errorMessage = `Validation failed for ${firstError.path}: ${firstError.message}`;
        }
        res.status(500).json({ success: false, message: errorMessage });
    }
});

// --- FILE UPLOAD ROUTE ---
router.post("/upload-image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const { userId, fieldName, role } = req.body; 
        
        if (!userId || !fieldName || !role) {
            fs.unlinkSync(req.file.path); 
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

// --- GET PROFILE ---
router.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        res.json({ success: true, user: user });

    } catch (err) {
        console.error("Fetch Profile Error:", err);
        return res.status(500).json({ success: false, message: "Server crash during fetch." });
    }
});

// --- FIND PARTNERS ROUTE (NEW) ---
router.get("/partners", async (req, res) => {
    try {
        const { role, location, niche } = req.query;

        // If I am a 'business', I want 'influencer's. If I am 'influencer', I want 'business'es.
        const targetRole = role === 'business' ? 'influencer' : 'business';
        
        let query = { role: targetRole, isProfileComplete: true };

        // Dynamic filters
        if (location) {
            query.$or = [
                { "businessProfile.location": { $regex: location, $options: "i" } },
                { "influencerProfile.location": { $regex: location, $options: "i" } }
            ];
        }

        if (niche) {
            if (targetRole === 'influencer') {
                query["influencerProfile.niche"] = { $regex: niche, $options: "i" };
            } else {
                query["businessProfile.industry"] = { $regex: niche, $options: "i" };
            }
        }

        // Fetch limited fields
        const partners = await User.find(query).select(
            "name email role businessProfile influencerProfile"
        );

        res.json({ success: true, partners });

    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ success: false, message: "Search failed." });
    }
});

export default router;