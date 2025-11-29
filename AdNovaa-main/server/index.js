import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "http"; 
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js"; 
import Request from "./models/Request.js"; 
import Message from "./models/Message.js"; 
import Conversation from "./models/Conversation.js";

dotenv.config();

// Fix directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app); 

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(bodyParser.json());

// --- CRITICAL FIX: SERVE IMAGES PUBLICLY ---
// This allows the frontend to access http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/adnovaDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes); 

// ... (Socket.io logic remains the same below) ...
io.on("connection", (socket) => {
  // 1. REGISTER
  socket.on("register_user", async (email) => {
    if (!email) return;
    const normalizedEmail = email.toLowerCase();
    socket.join(normalizedEmail);
    try {
      const pendingRequests = await Request.find({ receiverEmail: normalizedEmail });
      socket.emit("existing_requests", pendingRequests);
      const conversations = await Conversation.find({ participants: normalizedEmail });
      const formattedConversations = conversations.map(conv => {
        const otherUserEmail = conv.participants.find(p => p !== normalizedEmail) || normalizedEmail;
        return {
          id: conv._id,
          email: otherUserEmail,
          name: otherUserEmail.split("@")[0],
          avatar: otherUserEmail[0].toUpperCase(),
          lastMessage: conv.lastMessage,
          time: conv.lastMessageTime
        };
      });
      socket.emit("existing_conversations", formattedConversations);
    } catch (err) { console.error(err); }
  });

  // 2. JOIN ROOM
  socket.on("join_room", async (room) => {
    socket.join(room);
    try {
      const history = await Message.find({ room }).sort({ createdAt: 1 });
      socket.emit("chat_history", history);
    } catch (err) { console.error(err); }
  });

  // 3. SEND MESSAGE
  socket.on("send_message", async (data) => {
    const { room, author, message, time, participants } = data;
    try {
      const msg = new Message({ room, author, message, time });
      await msg.save();
      if (participants) {
          await Conversation.findOneAndUpdate(
            { participants: { $all: participants } },
            { lastMessage: "New Message", lastMessageTime: time }
          );
      }
      io.in(room).emit("receive_message", data); 
    } catch (err) { console.error(err); }
  });

  // 4. SEND REQUEST
  socket.on("send_request", async (data) => {
    const { to, requestData } = data;
    const sender = requestData.email.toLowerCase();
    const receiver = to.toLowerCase();
    if (sender === receiver) return;
    try {
      const existingConv = await Conversation.findOne({ participants: { $all: [sender, receiver] } });
      const existingReq = await Request.findOne({
        $or: [{ senderEmail: sender, receiverEmail: receiver }, { senderEmail: receiver, receiverEmail: sender }]
      });
      if (existingConv || existingReq) return; 

      const newRequest = new Request({
        senderName: requestData.name,
        senderEmail: sender,
        receiverEmail: receiver,
        timestamp: requestData.time
      });
      await newRequest.save();
      socket.to(receiver).emit("receive_request", { ...requestData, _id: newRequest._id });
    } catch (err) { console.error(err); }
  });

  // 5. ACCEPT REQUEST
  socket.on("accept_request", async (data) => {
    const { requestId, acceptorEmail, acceptorName } = data;
    try {
       const req = await Request.findById(requestId);
       if (!req) return;
       const senderEmail = req.senderEmail.toLowerCase();
       const myEmail = acceptorEmail.toLowerCase();
       const newConv = new Conversation({
         participants: [senderEmail, myEmail],
         lastMessage: "Conversation Started",
         lastMessageTime: "Now"
       });
       await newConv.save();
       await Request.findByIdAndDelete(requestId);
       socket.to(senderEmail).emit("request_accepted", { email: myEmail, name: acceptorName, conversationId: newConv._id });
       socket.emit("request_accepted_confirm", { email: senderEmail, conversationId: newConv._id });
    } catch(e) { console.error(e); }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));