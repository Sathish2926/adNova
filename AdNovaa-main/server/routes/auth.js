import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; 
import upload from "../config/multerConfig.js"; 
import fs from "fs"; 
import crypto from "crypto";
import nodemailer from "nodemailer"; 

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

// --- FORGOT PASSWORD ROUTE ---
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save reset token to user
        user.resetToken = resetTokenHash;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Create reset link
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

        // Configure nodemailer (update with your email service)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Email sending error:", err);
                return res.status(500).json({ success: false, message: "Failed to send reset email." });
            }
            res.json({ success: true, message: "Password reset link sent to your email." });
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

// --- RESET PASSWORD ROUTE ---
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required." });
        }

        // Hash the token to compare
        const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching token and check expiry
        const user = await User.findOne({
            resetToken: resetTokenHash,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successfully!" });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

export default router;