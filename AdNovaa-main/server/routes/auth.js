// ==============================
// FILE: server/routes/auth.js
// ==============================
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import upload from "../config/multerConfig.js"; 
import { scrapeSocials } from "../utils/socialScraper.js"; 
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
    try {
        // Destructure all fields
        let { name, email, password, role, phone, ownerName, businessName } = req.body;
        
        // --- FIX: If Business User, map 'businessName' to required 'name' field ---
        if (role === 'business' && !name && businessName) {
            name = businessName;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let profileData = {};
        
        // --- SAVE SIGNUP DATA TO PROFILE IMMEDIATELY ---
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

        // Update Social Stats on Login (Background Task)
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

        // Trigger Scrape on Update if Handles Changed
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

//forgot password route 
router.post("/forgot-password", async (req, res) => {
try {
    await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message: message
    });
    res.status(200).json({success:true,data:'Email sent'});
} catch (err) {
    console.log(err); // This will now print the actual error
    return next(new ErrorResponse('Email could not be sent', 500));
}
})
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