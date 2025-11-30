import mongoose from "mongoose";

const emptyStringToNull = (v) => (v === '' ? undefined : v);

const businessProfileSchema = new mongoose.Schema({
    brandName: { type: String, trim: true, set: emptyStringToNull },
    industry: { type: String, trim: true, set: emptyStringToNull },
    websiteUrl: { type: String, trim: true, set: emptyStringToNull },
    location: { type: String, trim: true, set: emptyStringToNull },
    ownerName: { type: String, trim: true }, 
    phoneNumber: { type: String, trim: true },
    targetAudience: { type: String, set: emptyStringToNull },
    avgBudgetPerCampaign: { type: String, set: emptyStringToNull },
    preferredPlatforms: [{ type: String }],
    logoUrl: { type: String, trim: true, set: emptyStringToNull }, 
    coverUrl: { type: String, trim: true, set: emptyStringToNull },
});

const influencerProfileSchema = new mongoose.Schema({
    displayName: { type: String, trim: true, set: emptyStringToNull },
    niche: { type: String, trim: true, set: emptyStringToNull },
    location: { type: String, trim: true, set: emptyStringToNull },
    bio: { type: String, trim: true, set: emptyStringToNull },
    pfp: { type: String, trim: true, set: emptyStringToNull },
    coverUrl: { type: String, trim: true, set: emptyStringToNull },
    
    // --- NEW SOCIAL FIELDS ---
    instagramHandle: { type: String, trim: true },
    youtubeHandle: { type: String, trim: true },
    
    followerCount: { type: Number, default: 0 }, // Total combined
    lastSocialUpdate: { type: Date, default: null },
    
    rateCard: { type: String },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["influencer", "business"], required: true },
    businessProfile: { type: businessProfileSchema, required: function() { return this.role === 'business'; } },
    influencerProfile: { type: influencerProfileSchema, required: function() { return this.role === 'influencer'; } },
    isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);