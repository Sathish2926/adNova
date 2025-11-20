import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// DATABASE CONNECTION
// ----------------------
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "AdNovaDB"
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

// ----------------------
// LOGIN ROUTE
// ----------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    return res.json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// TEST ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("Backend Server Running ✔");
});

// ----------------------
// START SERVER
// ----------------------
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
