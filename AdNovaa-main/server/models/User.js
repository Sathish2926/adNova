import mongoose from "mongoose";

// Helper to clean empty strings
const emptyStringToNull = (v) => (v === '' ? undefined : v);

// --- 1. Business Profile Schema ---
const businessProfileSchema = new mongoose.Schema({
    brandName: { type: String, trim: true, set: emptyStringToNull },
    industry: { type: String, trim: true, set: emptyStringToNull },
    websiteUrl: { type: String, trim: true, set: emptyStringToNull },
    location: { type: String, trim: true, set: emptyStringToNull },
    ownerName: { type: String, trim: true }, 
    phoneNumber: { type: String, trim: true },
    
    // Campaign Preferences
    targetAudience: { type: String, set: emptyStringToNull },
    avgBudgetPerCampaign: { type: String, set: emptyStringToNull },
    preferredPlatforms: [{ type: String }],
    
    // Images
    logoUrl: { type: String, trim: true, set: emptyStringToNull }, 
    coverUrl: { type: String, trim: true, set: emptyStringToNull },
    
    productGalleryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
});

// --- 2. Influencer Profile Schema ---
const influencerProfileSchema = new mongoose.Schema({
    displayName: { type: String, trim: true, set: emptyStringToNull },
    niche: { type: String, trim: true, set: emptyStringToNull },
    location: { type: String, trim: true, set: emptyStringToNull },
    bio: { type: String, trim: true, set: emptyStringToNull },
    
    // Images
    pfp: { type: String, trim: true, set: emptyStringToNull },
    coverUrl: { type: String, trim: true, set: emptyStringToNull }, // <--- ADDED THIS (Was missing)

    // Stats & Info
    followerCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    rateCard: { type: String },
    
    pastPromotionsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }], 
});

// --- 3. Main User Schema ---
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