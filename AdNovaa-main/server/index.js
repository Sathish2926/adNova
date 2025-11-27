import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "http"; 
import { Server } from "socket.io"; 
import authRoutes from "./routes/auth.js";
import Request from "./models/Request.js"; 
import Message from "./models/Message.js"; 
import Conversation from "./models/Conversation.js";

dotenv.config();

const app = express();
const httpServer = createServer(app); 

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/adnovaDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);

// --- SOCKET LOGIC ---
io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  // 1. REGISTER: Fetch Requests & Conversations
  socket.on("register_user", async (email) => {
    if (!email) return;
    const normalizedEmail = email.toLowerCase();
    socket.join(normalizedEmail);
    
    try {
      // A. Pending Requests (Only fetch pending ones)
      const pendingRequests = await Request.find({ receiverEmail: normalizedEmail });
      socket.emit("existing_requests", pendingRequests);

      // B. Conversations (The permanent contact list)
      const conversations = await Conversation.find({
        participants: normalizedEmail
      });
      
      const formattedConversations = conversations.map(conv => {
        const otherUserEmail = conv.participants.find(p => p !== normalizedEmail) || normalizedEmail;
        return {
          id: conv._id,
          email: otherUserEmail,
          name: otherUserEmail.split("@")[0], // Fallback name
          avatar: otherUserEmail[0].toUpperCase(),
          lastMessage: conv.lastMessage,
          time: conv.lastMessageTime
        };
      });
      
      socket.emit("existing_conversations", formattedConversations);

    } catch (err) {
      console.error("Error loading user data:", err);
    }
  });

  // 2. JOIN ROOM & LOAD HISTORY
  socket.on("join_room", async (room) => {
    socket.join(room);
    try {
      const history = await Message.find({ room }).sort({ createdAt: 1 });
      socket.emit("chat_history", history);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  });

  // 3. SEND MESSAGE
  socket.on("send_message", async (data) => {
    const { room, author, message, time, participants } = data;
    
    try {
      const msg = new Message({ room, author, message, time });
      await msg.save();

      // Update Conversation Preview
      if (participants) {
          await Conversation.findOneAndUpdate(
            { participants: { $all: participants } },
            { lastMessage: "New Message", lastMessageTime: time }
          );
      }

      // Broadcast to EVERYONE in the room (including sender)
      io.in(room).emit("receive_message", data); 
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // 4. SEND REQUEST (Strict Deduplication)
  socket.on("send_request", async (data) => {
    const { to, requestData } = data;
    const sender = requestData.email.toLowerCase();
    const receiver = to.toLowerCase();

    if (sender === receiver) return;

    try {
      // A. Check if they are ALREADY connected
      const existingConv = await Conversation.findOne({
        participants: { $all: [sender, receiver] }
      });
      
      // B. Check if a request is ALREADY pending
      const existingReq = await Request.findOne({
        $or: [
            { senderEmail: sender, receiverEmail: receiver },
            { senderEmail: receiver, receiverEmail: sender }
        ]
      });

      // If either exists, DO NOT create a new one.
      if (existingConv || existingReq) {
          // Ideally send an error back, but for now just return
          return; 
      }

      // C. Create New Request
      const newRequest = new Request({
        senderName: requestData.name,
        senderEmail: sender,
        receiverEmail: receiver,
        timestamp: requestData.time
      });
      await newRequest.save();

      // Notify Receiver
      socket.to(receiver).emit("receive_request", { ...requestData, _id: newRequest._id });
      
    } catch (err) {
      console.error("Error sending request:", err);
    }
  });

  // 5. ACCEPT REQUEST (Atomic Transaction style)
  socket.on("accept_request", async (data) => {
    const { requestId, acceptorEmail, acceptorName } = data;
    
    try {
       const req = await Request.findById(requestId);
       if (!req) return;

       const senderEmail = req.senderEmail.toLowerCase();
       const myEmail = acceptorEmail.toLowerCase();

       // 1. Create Permanent Conversation
       const newConv = new Conversation({
         participants: [senderEmail, myEmail],
         lastMessage: "Conversation Started",
         lastMessageTime: "Now"
       });
       await newConv.save();

       // 2. DELETE the pending Request
       await Request.findByIdAndDelete(requestId);

       // 3. Notify the SENDER (They need to know you accepted)
       socket.to(senderEmail).emit("request_accepted", {
           email: myEmail,
           name: acceptorName,
           conversationId: newConv._id
       });

       // 4. Confirm to ACCEPTOR (Optional, but good for sync)
       socket.emit("request_accepted_confirm", {
           email: senderEmail,
           conversationId: newConv._id
       });

    } catch(e) { console.error("Error accepting:", e); }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));