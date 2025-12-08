// ==============================
// FILE: server/routes/auth.js
// ==============================
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import upload from "../config/multerConfig.js"; 
import { scrapeSocials } from "../utils/socialScraper.js"; 
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";

const router = express.Router();

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
    try {
        let { name, email, password, role, phone, ownerName, businessName } = req.body;
        
        if (role === 'business' && !name && businessName) {
            name = businessName;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let profileData = {};
        if (role === "business") {
            profileData.businessProfile = {
                brandName: businessName || name, 
                ownerName: ownerName,
                phoneNumber: phone
            };
        } else if (role === "influencer") {
            profileData.influencerProfile = {
                displayName: name,
                phoneNumber: phone 
            };
        }
        
        const user = new User({ 
            name, email, password: hashedPassword, role, ...profileData 
        });
        await user.save();

        res.json({ 
            success: true, 
            message: "User registered!", 
            role: user.role, 
            isProfileComplete: user.isProfileComplete, 
            userId: user._id, 
            name: user.name, 
            email: user.email 
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ success: false, message: err.message || "Signup failed." });
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

        if (user.role === 'influencer') {
            const ig = user.influencerProfile?.instagramHandle;
            const yt = user.influencerProfile?.youtubeHandle;
            if (ig || yt) {
                scrapeSocials(ig, yt).then(async (count) => {
                    if (count > 0) {
                        await User.findByIdAndUpdate(user._id, {
                            'influencerProfile.followerCount': count,
                            'influencerProfile.lastSocialUpdate': new Date()
                        });
                    }
                }).catch(err => console.error("Login Scrape error:", err.message));
            }
        }

        res.json({ success: true, role: user.role, isProfileComplete: user.isProfileComplete, userId: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- UPDATE PROFILE ---
router.post("/update-profile", async (req, res) => {
    try {
        const { userId, role, profileData } = req.body;
        let updateQuery = {};
        
        if (role === 'business') {
            updateQuery = { $set: { businessProfile: profileData, isProfileComplete: true } };
        } else if (role === 'influencer') {
            updateQuery = { $set: { influencerProfile: profileData, isProfileComplete: true } };
        }

        const user = await User.findByIdAndUpdate(userId, updateQuery, { new: true });

        if (role === 'influencer') {
            const ig = profileData.instagramHandle;
            const yt = profileData.youtubeHandle;
            if (ig || yt) {
                scrapeSocials(ig, yt).then(async (count) => {
                    if (count > 0) {
                        await User.findByIdAndUpdate(userId, {
                            'influencerProfile.followerCount': count,
                            'influencerProfile.lastSocialUpdate': new Date()
                        });
                    }
                }).catch(err => console.error("Scrape failed:", err.message));
            }
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a token valid for 1 hour
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: "1h" });

        // IMPORTANT: Ensure this matches your Frontend URL
        const link = `http://localhost:5173/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password Link',
            text: `Click the following link to reset your password: ${link}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Reset link sent to email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// --- RESET PASSWORD (FIXED ROUTE) ---
router.post("/reset-password/:token", async (req, res) => {
    try {
        // 1. Get token from URL Parameter
        const { token } = req.params;
        // 2. Get new password from Body
        const { password } = req.body;
        
        if (!token) return res.status(400).json({ message: "Token missing" });
        if (!password) return res.status(400).json({ message: "Password missing" });

        // 3. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // 4. Hash New Password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 5. Update User
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        
        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ success: false, message: "Invalid or expired token" });
    }
});

// --- UPLOAD IMAGE ---
router.post("/upload-image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
        const { userId, fieldName, role } = req.body; 
        const fileUrl = req.file.path; 
        let updatePath = role === 'business' ? `businessProfile.${fieldName}` : `influencerProfile.${fieldName}`; 
        await User.findByIdAndUpdate(userId, { $set: { [updatePath]: fileUrl } }, { new: true });
        res.json({ success: true, fileUrl });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "Upload failed." });
    }
});

// --- GET PROFILE ---
router.get("/profile/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password'); 
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Fetch failed." });
    }
});

// --- FIND PARTNERS ---
router.get("/partners", async (req, res) => {
    try {
        const { role, location, niche } = req.query;
        const targetRole = role === 'business' ? 'influencer' : 'business';
        let query = { role: targetRole, isProfileComplete: true };

        if (location) {
            query.$or = [
                { "businessProfile.location": { $regex: location, $options: "i" } },
                { "influencerProfile.location": { $regex: location, $options: "i" } }
            ];
        }
        if (niche) {
            if (targetRole === 'influencer') query["influencerProfile.niche"] = { $regex: niche, $options: "i" };
            else query["businessProfile.industry"] = { $regex: niche, $options: "i" };
        }

        const partners = await User.find(query).select("name email role businessProfile influencerProfile");
        res.json({ success: true, partners });
    } catch (err) {
        res.status(500).json({ success: false, message: "Search failed." });
    }
});

// --- REFRESH SOCIALS ---
router.post("/refresh-socials", async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user || user.role !== 'influencer') return res.status(400).json({ success: false, message: "Invalid user." });

        const ig = user.influencerProfile?.instagramHandle;
        const yt = user.influencerProfile?.youtubeHandle;

        if (!ig && !yt) return res.json({ success: false, message: "No handles found." });

        const count = await scrapeSocials(ig, yt);
        if (count > 0) {
            user.influencerProfile.followerCount = count;
            user.influencerProfile.lastSocialUpdate = new Date();
            await user.save();
            return res.json({ success: true, count: count, message: "Stats updated!" });
        } else {
            return res.json({ success: false, message: "Scrape found 0." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
});

export default router;