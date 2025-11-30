import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// 1. Create Post
router.post("/create", async (req, res) => {
    try {
        const { userId, header, caption, image, role } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Get Profile Image
        let authorImage = role === 'business' ? user.businessProfile?.logoUrl : user.influencerProfile?.pfp;
        let authorLocation = role === 'business' ? user.businessProfile?.location : user.influencerProfile?.location;

        const newPost = new Post({
            authorId: userId,
            authorName: user.name,
            authorRole: role,
            authorImage: authorImage || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
            authorLocation: authorLocation || "Global",
            image, // This expects a URL like "/uploads/filename.jpg"
            header,
            caption
        });

        await newPost.save();
        res.json({ success: true, post: newPost });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Get Feed (Filter Own Posts & Sort by Location)
router.get("/feed", async (req, res) => {
    try {
        const { userLocation, userId } = req.query; // <--- Get userId from query

        // Filter: Exclude posts where authorId == userId
        let query = {};
        if (userId) {
            query.authorId = { $ne: userId };
        }

        let posts = await Post.find(query).sort({ createdAt: -1 });

        // Location Priority Sort
        if (userLocation) {
            const lowerUserLoc = userLocation.toLowerCase().trim();
            posts.sort((a, b) => {
                const locA = (a.authorLocation || "").toLowerCase();
                const locB = (b.authorLocation || "").toLowerCase();
                const isAMatch = locA.includes(lowerUserLoc);
                const isBMatch = locB.includes(lowerUserLoc);
                if (isAMatch && !isBMatch) return -1;
                if (!isAMatch && isBMatch) return 1;
                return 0;
            });
        }

        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Get User Posts
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;