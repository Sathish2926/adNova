import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ["influencer", "business"] },

  // Common
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Influencer Fields
  name: String,
  phone: String,

  // Business Fields
  businessName: String,
  ownerName: String,
  contactNumber: String,
});

export default mongoose.model("User", userSchema);
