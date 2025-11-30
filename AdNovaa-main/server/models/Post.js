import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true }, 
  authorRole: { type: String, enum: ['business', 'influencer'], required: true },
  authorImage: { type: String }, 
  authorLocation: { type: String, default: "Global" }, // <--- ADDED THIS
  image: { type: String, required: true },
  header: { type: String },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", PostSchema);