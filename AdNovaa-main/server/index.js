import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "http"; 
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron"; 
import puppeteer from "puppeteer";
import authRoutes from './routes/auth.js';
import postRoutes from "./routes/Posts.js"; 
import Request from "./models/Request.js"; 
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import User from "./models/User.js"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

let browser = null;
let scrapeQueue = Promise.resolve();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL
];

const io = new Server(httpServer, {
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes); 

app.post("/api/scrape", async (req, res) => {
    const { username } = req.body;
    scrapeQueue = scrapeQueue.then(async () => {
        let page = null;
        try {
            if (!browser || !browser.isConnected()) {
                browser = await puppeteer.launch({
                    headless: "new",
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu']
                });
            }
            page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
                else req.continue();
            });
            await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
            const data = await page.evaluate(() => {
                const meta = document.querySelector('meta[property="og:description"]');
                if (meta) {
                    const content = meta.content;
                    const followersMatch = content.match(/([0-9.,KMB]+)\s+Followers/);
                    return followersMatch ? followersMatch[1] : null;
                }
                return null;
            });
            res.json({ success: true, count: data });
        } catch (error) {
            console.error(error);
            if (!res.headersSent) res.status(500).json({ error: "Failed to scrape" });
        } finally {
            if (page) await page.close();
        }
    }).catch(e => console.error("Queue Error:", e));
});

cron.schedule('0 0 * * *', async () => {
    console.log("Running Daily Social Scraper...");
    try {
        const influencers = await User.find({ role: 'influencer' });
        for (const user of influencers) {
            scrapeQueue = scrapeQueue.then(async () => {
                const inf = user.influencerProfile;
                if (!inf.instagramHandle) return;
                let page = null;
                try {
                    if (!browser || !browser.isConnected()) {
                        browser = await puppeteer.launch({
                            headless: "new",
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
                        });
                    }
                    page = await browser.newPage();
                    await page.setRequestInterception(true);
                    page.on('request', (req) => {
                        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
                        else req.continue();
                    });
                    await page.goto(`https://www.instagram.com/${inf.instagramHandle}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    const count = await page.evaluate(() => {
                        const meta = document.querySelector('meta[property="og:description"]');
                        if (meta) {
                            const match = meta.content.match(/([0-9.,KMB]+)\s+Followers/);
                            return match ? match[1] : null;
                        }
                        return null;
                    });
                    if (count) {
                        user.influencerProfile.followerCount = count;
                        user.influencerProfile.lastSocialUpdate = new Date();
                        await user.save();
                    }
                } catch (e) { console.error(`Failed for ${inf.instagramHandle}`, e); }
                finally { if (page) await page.close(); }
            });
        }
    } catch (e) { console.error("Cron Error", e); }
});

io.on("connection", (socket) => {
  socket.on("register_user", async (email) => {
    if (!email) return;
    const normalizedEmail = email.toLowerCase();
    socket.join(normalizedEmail);
    try {
      const pendingRequests = await Request.find({ receiverEmail: normalizedEmail });
      socket.emit("existing_requests", pendingRequests);
      const conversations = await Conversation.find({ participants: normalizedEmail });
      const formattedConversations = await Promise.all(conversations.map(async (conv) => {
        const otherUserEmail = conv.participants.find(p => p !== normalizedEmail) || normalizedEmail;
        const user = await User.findOne({ email: otherUserEmail });
        let displayName = otherUserEmail.split("@")[0];
        let displayImage = ""; 
        if (user) {
            if (user.role === 'business') {
                displayName = user.businessProfile?.brandName || user.name;
                displayImage = user.businessProfile?.logoUrl;
            } else {
                displayName = user.influencerProfile?.displayName || user.name;
                displayImage = user.influencerProfile?.pfp;
            }
        }
        return {
          id: conv._id,
          email: otherUserEmail,
          name: displayName,
          image: displayImage, 
          role: "connected",
          lastMessage: conv.lastMessage,
          time: conv.lastMessageTime
        };
      }));
      socket.emit("existing_conversations", formattedConversations);
    } catch (err) { console.error(err); }
  });

  socket.on("join_room", async (room) => {
    socket.join(room);
    const history = await Message.find({ room }).sort({ createdAt: 1 });
    socket.emit("chat_history", history);
  });

  socket.on("send_message", async (data) => {
    const { room, author, message, time, participants } = data;
    const msg = new Message({ room, author, message, time });
    await msg.save();
    if (participants) {
        await Conversation.findOneAndUpdate({ participants: { $all: participants } }, { lastMessage: "New Message", lastMessageTime: time });
    }
    io.in(room).emit("receive_message", data); 
  });

  socket.on("send_request", async (data) => {
    const { to, requestData } = data;
    const sender = requestData.email.toLowerCase();
    const receiver = to.toLowerCase();
    if (sender === receiver) return;
    const existingConv = await Conversation.findOne({ participants: { $all: [sender, receiver] } });
    const existingReq = await Request.findOne({ $or: [{ senderEmail: sender, receiverEmail: receiver }, { senderEmail: receiver, receiverEmail: sender }] });
    if (existingConv || existingReq) return; 
    const newRequest = new Request({ senderName: requestData.name, senderEmail: sender, receiverEmail: receiver, timestamp: requestData.time });
    await newRequest.save();
    socket.to(receiver).emit("receive_request", { ...requestData, _id: newRequest._id });
  });

  socket.on("accept_request", async (data) => {
    const { requestId, acceptorEmail, acceptorName } = data;
    const req = await Request.findById(requestId);
    if (!req) return;
    const senderEmail = req.senderEmail.toLowerCase();
    const myEmail = acceptorEmail.toLowerCase();
    const newConv = new Conversation({ participants: [senderEmail, myEmail], lastMessage: "Conversation Started", lastMessageTime: "Now" });
    await newConv.save();
    await Request.findByIdAndDelete(requestId);
    const acceptorUser = await User.findOne({ email: myEmail });
    let acceptorImage = "";
    if(acceptorUser) {
      acceptorImage = acceptorUser.role === 'business' ? acceptorUser.businessProfile?.logoUrl : acceptorUser.influencerProfile?.pfp;
    }
    socket.to(senderEmail).emit("request_accepted", { email: myEmail, name: acceptorName, image: acceptorImage, conversationId: newConv._id });
    socket.emit("request_accepted_confirm", { email: senderEmail, conversationId: newConv._id });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));