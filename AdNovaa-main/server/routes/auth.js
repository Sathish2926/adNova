import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import upload from "../config/multerConfig.js"; 
import { scrapeSocials } from "../utils/socialScraper.js"; 

const router = express.Router();

// --- SIGNUP ROUTE (UPDATED FOR AUTO-LOGIN) ---
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        let profileData = {};
        if (role === "business") profileData.businessProfile = {};
        else if (role === "influencer") profileData.influencerProfile = {};
        
        const user = new User({ name, email, password: hashedPassword, role, ...profileData });
        await user.save();

        // RETURN ALL DATA NEEDED FOR CONTEXT LOGIN
        res.json({ 
            success: true, 
            message: "User registered!", 
            role: user.role, 
            isProfileComplete: user.isProfileComplete, 
            userId: user._id,
            name: user.name,   // <--- Added
            email: user.email  // <--- Added
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ success: false, message: "Signup failed." });
    }
});

// ... (Keep Login, Update, Upload, Get Profile, Find Partners routes exactly the same) ...
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
                }).catch(err => console.error("Login Scrape Failed:", err.message));
            }
        }

        res.json({ success: true, role: user.role, isProfileComplete: user.isProfileComplete, userId: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- PROFILE UPDATE ---
router.post("/update-profile", async (req, res) => {
    try {
        const { userId, role, profileData } = req.body;
        let updateQuery = {};
        if (role === 'business') updateQuery = { $set: { businessProfile: profileData, isProfileComplete: true } };
        else if (role === 'influencer') updateQuery = { $set: { influencerProfile: profileData, isProfileComplete: true } };

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
                }).catch(err => console.error(err));
            }
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- UPLOAD ---
router.post("/upload-image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
        const { userId, fieldName, role } = req.body; 
        const fileUrl = `/uploads/${req.file.filename}`;
        let updatePath = role === 'business' ? `businessProfile.${fieldName}` : `influencerProfile.${fieldName}`; 
        await User.findByIdAndUpdate(userId, { $set: { [updatePath]: fileUrl } }, { new: true });
        res.json({ success: true, fileUrl });
    } catch (err) {
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
        
        if (!user || user.role !== 'influencer') {
            return res.status(400).json({ success: false, message: "Invalid user." });
        }

        const ig = user.influencerProfile?.instagramHandle;
        const yt = user.influencerProfile?.youtubeHandle;

        if (!ig && !yt) {
            return res.json({ success: false, message: "No handles found." });
        }

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
        console.error("Refresh Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

export default router;