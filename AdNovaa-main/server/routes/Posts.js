// ==============================
// FILE: server/routes/posts.js
// ==============================
import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// --- CREATE POST ROUTE ---
router.post("/create", async (req, res) => {
    try {
        const { userId, role, header, caption, image } = req.body;

        // 1. Fetch Author Details to embed in the post
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        let authorName, authorImage, authorLocation;

        if (role === 'business') {
            authorName = user.businessProfile?.brandName || user.name;
            authorImage = user.businessProfile?.logoUrl;
            authorLocation = user.businessProfile?.location || "Global";
        } else {
            authorName = user.influencerProfile?.displayName || user.name;
            authorImage = user.influencerProfile?.pfp;
            authorLocation = user.influencerProfile?.location || "Global";
        }

        // 2. Create Post
        const newPost = new Post({
            authorId: userId,
            authorName,
            authorRole: role,
            authorImage,
            authorLocation,
            image,
            header,
            caption
        });

        await newPost.save();
        res.json({ success: true, post: newPost });

    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(500).json({ success: false, message: "Failed to create post" });
    }
});

// --- FEED ROUTE (Fixed) ---
router.get("/feed", async (req, res) => {
    try {
        const { userLocation, userId, search, location, minReach, niche, viewerRole } = req.query;
        
        let query = {};
        if (userId) query.authorId = { $ne: userId }; 

        // CROSS-ROLE LOGIC
        if (viewerRole) {
            // If I am Business, I want Influencer posts
            if (viewerRole === 'business') query.authorRole = 'influencer';
            // If I am Influencer, I want Business posts
            else if (viewerRole === 'influencer') query.authorRole = 'business';
        }

        if (search) query.authorName = { $regex: search, $options: "i" };
        if (location) query.authorLocation = { $regex: location, $options: "i" };

        let posts = await Post.find(query).sort({ createdAt: -1 }).lean();

        // Filter Loop (Reach + Niche)
        const filteredPosts = [];
        for (const post of posts) {
            const author = await User.findById(post.authorId).select('influencerProfile businessProfile role');
            if(!author) continue;

            // Reach Check (Only relevant if searching for Influencers)
            if (viewerRole === 'business' && minReach && Number(minReach) > 0) {
                const count = author.influencerProfile?.followerCount || 0;
                if (count < Number(minReach)) continue; 
            }

            // Niche Check
            if (niche) {
                const userNiches = author.role === 'business' ? author.businessProfile?.niches : author.influencerProfile?.niches;
                if (!userNiches || !userNiches.includes(niche)) continue;
            }

            post.authorNiches = author.role === 'business' ? author.businessProfile?.niches : author.influencerProfile?.niches;
            filteredPosts.push(post);
        }
        
        posts = filteredPosts;

        // Location Sort
        if (userLocation && !location) {
            const lowerUserLoc = userLocation.toLowerCase().trim();
            posts.sort((a, b) => {
                const locA = (a.authorLocation || "").toLowerCase();
                const locB = (b.authorLocation || "").toLowerCase();
                if (locA.includes(lowerUserLoc) && !locB.includes(lowerUserLoc)) return -1;
                if (!locA.includes(lowerUserLoc) && locB.includes(lowerUserLoc)) return 1;
                return 0;
            });
        }

        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- GET USER POSTS ROUTE ---
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;