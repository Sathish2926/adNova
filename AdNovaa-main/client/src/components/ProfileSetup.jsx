import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import '../styles/profilesetup.css'; 

// --- Define Initial State Constants ---
const initialBusinessProfile = {
    brandName: '', industry: '', websiteUrl: '', location: '',
    targetAudience: '', avgBudgetPerCampaign: 'Negotiable', preferredPlatforms: [], 
};

const initialInfluencerProfile = {
    displayName: '', niche: '', followerCount: '', engagementRate: '',
    primaryPlatform: 'Instagram', rateCard: '', location: '', bio: '', pfp: '',
};

const PROFILE_UPDATE_API_URL = "http://localhost:5000/api/auth/update-profile"; 

export default function ProfileSetup() { 
    
    // 1. CALL ALL HOOKS FIRST, UNCONDITIONALLY
    const { role, userId, completeProfile } = useAuth();
    const navigate = useNavigate();
    
    // Initialize state unconditionally
    const isBusiness = role === 'business';
    const [profileData, setProfileData] = useState(
        isBusiness ? initialBusinessProfile : initialInfluencerProfile
    );
    const [isLoading, setIsLoading] = useState(false);

    // 2. NOW, PLACE THE CONDITIONAL GUARD
    if (!userId) {
        return <Navigate to="/" replace />;
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformChange = (e) => {
        const { value, checked } = e.target;
        setProfileData(prev => {
            const platforms = prev.preferredPlatforms || [];
            if (checked) {
                return { ...prev, preferredPlatforms: [...platforms, value] };
            } else {
                return { ...prev, preferredPlatforms: platforms.filter(p => p !== value) };
            }
        });
    };
    
    const safeNumber = (value) => {
        if (value === '' || value === undefined) return 0; 
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let finalPayloadProfile = {};

        // 🚨 CRITICAL FIX: Only send fields that have a non-empty string value for Business Profile
        if (isBusiness) {
            for (const key in profileData) {
                const value = profileData[key];
                
                if (key === 'preferredPlatforms') {
                    // Always include the array field, even if empty
                    finalPayloadProfile[key] = value || [];
                } else if (typeof value === 'string' && value.trim() !== '' && value !== 'Negotiable') {
                    // Only include strings if they have actual content and aren't the default select option
                    finalPayloadProfile[key] = value.trim();
                } else if (value !== '' && typeof value !== 'string') {
                    // Include any non-string values (shouldn't happen here, but safe)
                    finalPayloadProfile[key] = value;
                }
            }
        } else {
            // Influencer logic (which already works)
            finalPayloadProfile = { 
                ...profileData, 
                followerCount: safeNumber(profileData.followerCount),
                engagementRate: safeNumber(profileData.engagementRate)
            };
        }
        
        try {
            const response = await fetch(PROFILE_UPDATE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send the minimized, cleaned payload
                body: JSON.stringify({ userId, role: role, profileData: finalPayloadProfile }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(data.message);
                
                completeProfile(); 
                
                const dashboardPath = isBusiness ? '/BusinessDashboard' : '/InfluencerDashboard';
                navigate(dashboardPath, { replace: true });
            } else {
                const errorMessage = data.message || 'Unknown update error.';
                // If it fails, the server should return the specific validation message now
                alert('Profile update failed: ' + errorMessage); 
            }
        } catch (error) {
            console.error("Profile update error:", error);
            alert('An error occurred while saving your profile.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Form Fields (JSX remains the same) ---
    const FormFields = isBusiness ? (
        // ... (Business JSX remains the same) ...
        <>
            <input type="text" name="brandName" placeholder="Brand Name" required value={profileData.brandName} onChange={handleChange} />
            <input type="text" name="industry" placeholder="Industry (e.g., E-commerce, SaaS)" required value={profileData.industry} onChange={handleChange} />
            <input type="text" name="websiteUrl" placeholder="Website URL" value={profileData.websiteUrl} onChange={handleChange} />
            <input type="text" name="location" placeholder="Operating City/Region" value={profileData.location} onChange={handleChange} />
            
            <textarea name="targetAudience" placeholder="Describe your target audience (e.g., 18-25, interested in tech)" required value={profileData.targetAudience} onChange={handleChange} />
            
            <select name="avgBudgetPerCampaign" value={profileData.avgBudgetPerCampaign} onChange={handleChange} required>
                <option value="Negotiable">Negotiable</option>
                <option value="$100 - $500">$100 - $500</option>
                <option value="$500 - $1500">$500 - $1500</option>
                <option value=">$1500">$1500</option>
            </select>

            <fieldset>
                <legend>Preferred Platforms:</legend>
                {['Instagram', 'TikTok', 'YouTube', 'X'].map(p => (
                    <label key={p}>
                        <input type="checkbox" value={p} checked={profileData.preferredPlatforms.includes(p)} onChange={handlePlatformChange} /> {p}
                    </label>
                ))}
            </fieldset>
        </>
    ) : (
        // ... (Influencer JSX remains the same) ...
        <>
            <input type="text" name="displayName" placeholder="Display Name/Handle" required value={profileData.displayName} onChange={handleChange} />
            <input type="text" name="niche" placeholder="Niche (e.g., Fitness, Travel, Food)" required value={profileData.niche} onChange={handleChange} />
            <input type="text" name="location" placeholder="Operating City/Region" value={profileData.location} onChange={handleChange} />
            <textarea name="bio" placeholder="Tell us about yourself..." value={profileData.bio} onChange={handleChange} />

            <input type="number" name="followerCount" placeholder="Total Follower Count" required value={profileData.followerCount} onChange={handleChange} />
            <input type="number" step="0.01" max="100" name="engagementRate" placeholder="Engagement Rate (%)" required value={profileData.engagementRate} onChange={handleChange} />
            <input type="text" name="rateCard" placeholder="Link to Rate Card/Price details" value={profileData.rateCard} onChange={handleChange} />
            
            <select name="primaryPlatform" value={profileData.primaryPlatform} onChange={handleChange} required>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="X">X (Twitter)</option>
            </select>
        </>
    );

    return (
        <div className='profile-setup-container'>
            <h2>{isBusiness ? 'Business Profile Setup' : 'Influencer Profile Setup'}</h2>
            <p>Please complete your profile details to start connecting with partners.</p>
            
            <form onSubmit={handleSubmit} className='profile-setup-form'>
                {FormFields}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Complete Setup'}
                </button>
            </form>
        </div>
    );
}