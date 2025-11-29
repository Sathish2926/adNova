import mongoose from "mongoose";

// --- 1. Define Sub-Schemas for Each Role's Unique Data ---
const emptyStringToNull = (v) => (v === '' ? undefined : v);

const businessProfileSchema = new mongoose.Schema({
    // Brand Identity
    brandName: { type: String, trim: true, set: emptyStringToNull }, // FIX APPLIED HERE
    industry: { type: String, trim: true, set: emptyStringToNull },  // FIX APPLIED HERE
    websiteUrl: { type: String, trim: true, set: emptyStringToNull },
    location: { type: String, trim: true, set: emptyStringToNull },
    ownerName: { type: String, trim: true }, // Map to the 'owner' field in JSX
    phoneNumber: { type: String, trim: true },
    // Campaign Preferences
    targetAudience: { type: String, set: emptyStringToNull },        // FIX APPLIED HERE
    avgBudgetPerCampaign: { type: String, set: emptyStringToNull },
    preferredPlatforms: [{ type: String }],
    
    // Media URLs for Dashboard
    logoUrl: { type: String, trim: true, set: emptyStringToNull }, 
    coverUrl: { type: String, trim: true, set: emptyStringToNull },
    
    productGalleryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
});

// Influencer Profile Schema also needs the same fix for safety
const influencerProfileSchema = new mongoose.Schema({
    // Personal/Professional Identity
    displayName: { type: String, trim: true, set: emptyStringToNull },
    niche: { type: String, trim: true, set: emptyStringToNull },
    
    // Added Missing Fields for Dashboard
    location: { type: String, trim: true, set: emptyStringToNull },
    bio: { type: String, trim: true, set: emptyStringToNull },
    pfp: { type: String, trim: true, set: emptyStringToNull },
    // Monetization
    rateCard: { type: String },
    
    pastPromotionsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }], 
});


// --- 2. Main User Schema ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["influencer", "business"], 
        required: true 
    },

    businessProfile: { 
        type: businessProfileSchema,
        required: function() { return this.role === 'business'; }
    },
    influencerProfile: {
        type: influencerProfileSchema,
        required: function() { return this.role === 'influencer'; }
    },
    
    isProfileComplete: { type: Boolean, default: false },
    
    // Password reset fields
    resetToken: { type: String, default: undefined },
    resetTokenExpiry: { type: Date, default: undefined }

}, { timestamps: true });

export default mongoose.model("User", userSchema);