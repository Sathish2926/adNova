import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { userId, header, caption, image, role } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        let authorImage = role === 'business' ? user.businessProfile?.logoUrl : user.influencerProfile?.pfp;
        let authorLocation = role === 'business' ? user.businessProfile?.location : user.influencerProfile?.location;

        const newPost = new Post({
            authorId: userId,
            authorName: user.name,
            authorRole: role,
            authorImage: authorImage || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
            authorLocation: authorLocation || "Global",
            image, // This will now be the Cloudinary URL sent from frontend
            header,
            caption
        });

        await newPost.save();
        res.json({ success: true, post: newPost });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ... (Keep existing GET routes) ...
router.get("/feed", async (req, res) => {
    try {
        const { userLocation, userId } = req.query;
        let query = {};
        if (userId) query.authorId = { $ne: userId };

        let posts = await Post.find(query).sort({ createdAt: -1 });

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

router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;