import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }], // ["user1@email.com", "user2@email.com"]
  // Ensure at least one participant
  participants: {
    type: [String],
    required: true,
    validate: [arr => Array.isArray(arr) && arr.length > 0, 'At least one participant is required.']
  },
  lastMessage: { type: String, default: "New connection established" },
  lastMessageTime: { type: String, default: () => new Date().toLocaleTimeString() },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;