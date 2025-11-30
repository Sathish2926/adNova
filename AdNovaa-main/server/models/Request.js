import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  status: { type: String, default: "pending" },
  timestamp: { type: String, default: () => new Date().toLocaleTimeString() }
});

const Request = mongoose.model("Request", RequestSchema);

export default Request;