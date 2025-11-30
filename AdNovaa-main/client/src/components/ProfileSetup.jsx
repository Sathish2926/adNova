import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import Navbar from './navbar'; 
import '../styles/profilesetup.css';

const PROFILE_UPDATE_API_URL = "http://localhost:5000/api/auth/update-profile"; 

export default function ProfileSetup() { 
    const { role, userId, completeProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Initial States
    const [bizData, setBizData] = useState({
        brandName: '', industry: '', websiteUrl: '', location: '',
        targetAudience: '', avgBudgetPerCampaign: 'Negotiable',
    });

    const [infData, setInfData] = useState({
        displayName: '', niche: '', location: '', bio: '',
        instagramHandle: '', youtubeHandle: '',
        rateCard: ''
    });

    const [hasInsta, setHasInsta] = useState(false);
    const [hasYT, setHasYT] = useState(false);

    if (!userId) return <Navigate to="/" replace />;
    
    const isBusiness = role === 'business';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // ... (payload logic) ...
        try {
            const response = await fetch(PROFILE_UPDATE_API_URL, /*...*/);
            const data = await response.json();
            if (data.success) {
                completeProfile(); 
                const path = isBusiness ? '/BusinessDashboard' : '/InfluencerDashboard';
                navigate(path, { replace: true });
            } else {
                console.error('Update failed: ' + data.message);
            }
        } catch (error) { console.error(error); } 
        finally { setIsLoading(false); }
    };
    return (
        <>
        <Navbar />
        {/* Wrapper to fix Background */}
        <div className="profile-page-wrapper">
            <div className='profile-setup-container'>
                <h2>{isBusiness ? 'Business Profile' : 'Creator Profile'}</h2>
                <p>Complete your details to access the marketplace.</p>
                
                <form onSubmit={handleSubmit} className='profile-setup-form'>
                    
                    {isBusiness ? (
                        <>
                            <input type="text" placeholder="Brand Name" required value={bizData.brandName} onChange={e => setBizData({...bizData, brandName: e.target.value})} />
                            <input type="text" placeholder="Industry (e.g. Fashion, Tech)" required value={bizData.industry} onChange={e => setBizData({...bizData, industry: e.target.value})} />
                            <input type="text" placeholder="Website URL" value={bizData.websiteUrl} onChange={e => setBizData({...bizData, websiteUrl: e.target.value})} />
                            <input type="text" placeholder="Location (City, Country)" value={bizData.location} onChange={e => setBizData({...bizData, location: e.target.value})} />
                            <textarea placeholder="Describe your target audience..." required rows="4" value={bizData.targetAudience} onChange={e => setBizData({...bizData, targetAudience: e.target.value})} />
                            <select value={bizData.avgBudgetPerCampaign} onChange={e => setBizData({...bizData, avgBudgetPerCampaign: e.target.value})}>
                                <option value="Negotiable">Budget: Negotiable</option>
                                <option value="$100 - $500">$100 - $500</option>
                                <option value="$500 - $1500">$500 - $1500</option>
                                <option value=">$1500">$1500+</option>
                            </select>
                        </>
                    ) : (
                        <>
                            <input type="text" placeholder="Display Name / Handle" required value={infData.displayName} onChange={e => setInfData({...infData, displayName: e.target.value})} />
                            <input type="text" placeholder="Niche (e.g. Fitness, Travel)" required value={infData.niche} onChange={e => setInfData({...infData, niche: e.target.value})} />
                            <input type="text" placeholder="Location" value={infData.location} onChange={e => setInfData({...infData, location: e.target.value})} />
                            <textarea placeholder="Tell us about yourself (Bio)..." required rows="4" value={infData.bio} onChange={e => setInfData({...infData, bio: e.target.value})} />
                            
                            <div className="social-toggle-group">
                                <label className="social-checkbox">
                                    <input type="checkbox" checked={hasInsta} onChange={e => setHasInsta(e.target.checked)} />
                                    Instagram
                                </label>
                                <label className="social-checkbox">
                                    <input type="checkbox" checked={hasYT} onChange={e => setHasYT(e.target.checked)} />
                                    YouTube
                                </label>
                            </div>

                            {hasInsta && (
                                <input type="text" placeholder="Instagram Handle (e.g. adnova_official)" value={infData.instagramHandle} onChange={e => setInfData({...infData, instagramHandle: e.target.value})} />
                            )}
                            {hasYT && (
                                <input type="text" placeholder="YouTube Handle (e.g. AdNovaChannel)" value={infData.youtubeHandle} onChange={e => setInfData({...infData, youtubeHandle: e.target.value})} />
                            )}

                            <input type="text" placeholder="Link to Rate Card (Optional)" value={infData.rateCard} onChange={e => setInfData({...infData, rateCard: e.target.value})} />
                        </>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Syncing...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
}