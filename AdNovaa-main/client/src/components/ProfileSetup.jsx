import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import Navbar from './navbar'; 
import '../styles/profilesetup.css';
import API_BASE_URL from "../apiConfig";

const PROFILE_UPDATE_API_URL = `${API_BASE_URL}/api/auth/update-profile`;
const PROFILE_FETCH_URL = (id) => `${API_BASE_URL}/api/auth/profile/${id}`;

const COMMON_NICHES = [
    "Fashion", "Beauty", "Tech", "Gaming", "Travel", "Food", 
    "Fitness", "Health", "Lifestyle", "Parenting", "Business", 
    "Finance", "Education", "Entertainment", "Music", "Art"
];

export default function ProfileSetup() { 
    const { role, userId, completeProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Initial States
    const [bizData, setBizData] = useState({
        brandName: '', industry: '', websiteUrl: '', location: '',
        targetAudience: '', budgetMin: '', budgetMax: '', niches: []
    });

    const [infData, setInfData] = useState({
        displayName: '', niche: '', location: '', bio: '',
        instagramHandle: '', youtubeHandle: '', rateCard: '', niches: []
    });

    const [customNiche, setCustomNiche] = useState("");
    const [hasInsta, setHasInsta] = useState(false);
    const [hasYT, setHasYT] = useState(false);

    // --- PRE-FILL DATA FROM SIGNUP ---
    useEffect(() => {
        if(userId) {
            fetch(PROFILE_FETCH_URL(userId))
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    if (role === 'business') {
                        setBizData(prev => ({
                            ...prev,
                            brandName: data.user.businessProfile?.brandName || data.user.name || '',
                            // Map other fields if needed
                        }));
                    } else {
                        setInfData(prev => ({
                            ...prev,
                            displayName: data.user.influencerProfile?.displayName || data.user.name || '',
                        }));
                    }
                }
            })
            .catch(console.error);
        }
    }, [userId, role]);

    if (!userId) return <Navigate to="/" replace />;
    
    const isBusiness = role === 'business';

    const toggleNiche = (niche) => {
        if (isBusiness) {
            setBizData(prev => {
                const exists = prev.niches.includes(niche);
                return { ...prev, niches: exists ? prev.niches.filter(n => n !== niche) : [...prev.niches, niche] };
            });
        } else {
            setInfData(prev => {
                const exists = prev.niches.includes(niche);
                return { ...prev, niches: exists ? prev.niches.filter(n => n !== niche) : [...prev.niches, niche] };
            });
        }
    };

    const addCustomNiche = (e) => {
        e.preventDefault();
        if (customNiche && !COMMON_NICHES.includes(customNiche)) {
            toggleNiche(customNiche);
            setCustomNiche("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let profilePayload = isBusiness ? bizData : {
            ...infData,
            instagramHandle: hasInsta ? infData.instagramHandle : "",
            youtubeHandle: hasYT ? infData.youtubeHandle : ""
        };
        
        try {
            const response = await fetch(PROFILE_UPDATE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role, profileData: profilePayload }),
            });

            if (!response.ok) throw new Error("Server Error");
            const data = await response.json();

            if (data.success) {
                completeProfile(); 
                const path = isBusiness ? '/BusinessDashboard' : '/InfluencerDashboard';
                navigate(path, { replace: true });
            } else {
                alert('Update failed: ' + data.message);
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const currentNiches = isBusiness ? bizData.niches : infData.niches;

    return (
        <>
        <Navbar />
        <div className="profile-page-wrapper">
            <div className='profile-setup-container'>
                <h2>{isBusiness ? 'Business Profile' : 'Creator Profile'}</h2>
                <p>Complete your details to access the marketplace.</p>
                
                <form onSubmit={handleSubmit} className='profile-setup-form'>
                    {isBusiness ? (
                        <>
                            <input type="text" placeholder="Brand Name" required value={bizData.brandName} onChange={e => setBizData({...bizData, brandName: e.target.value})} />
                            <input type="text" placeholder="Industry" required value={bizData.industry} onChange={e => setBizData({...bizData, industry: e.target.value})} />
                            <input type="text" placeholder="Website URL" value={bizData.websiteUrl} onChange={e => setBizData({...bizData, websiteUrl: e.target.value})} />
                            <input type="text" placeholder="Location" value={bizData.location} onChange={e => setBizData({...bizData, location: e.target.value})} />
                            <textarea placeholder="Describe your target audience..." required rows="4" value={bizData.targetAudience} onChange={e => setBizData({...bizData, targetAudience: e.target.value})} />
                            
                            {/* CHANGED: MANUAL BUDGET RANGE */}
                            <div style={{display:'flex', gap:'15px'}}>
                                <input type="number" placeholder="Min Budget ($)" value={bizData.budgetMin} onChange={e => setBizData({...bizData, budgetMin: e.target.value})} />
                                <input type="number" placeholder="Max Budget ($)" value={bizData.budgetMax} onChange={e => setBizData({...bizData, budgetMax: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <>
                            <input type="text" placeholder="Display Name / Handle" required value={infData.displayName} onChange={e => setInfData({...infData, displayName: e.target.value})} />
                            <input type="text" placeholder="Location" value={infData.location} onChange={e => setInfData({...infData, location: e.target.value})} />
                            <textarea placeholder="Bio..." required rows="4" value={infData.bio} onChange={e => setInfData({...infData, bio: e.target.value})} />
                            
                            <div className="social-toggle-group">
                                <label className="social-checkbox"><input type="checkbox" checked={hasInsta} onChange={e => setHasInsta(e.target.checked)} /> Instagram</label>
                                <label className="social-checkbox"><input type="checkbox" checked={hasYT} onChange={e => setHasYT(e.target.checked)} /> YouTube</label>
                            </div>

                            {hasInsta && <input type="text" placeholder="Instagram Handle" value={infData.instagramHandle} onChange={e => setInfData({...infData, instagramHandle: e.target.value})} />}
                            {hasYT && <input type="text" placeholder="YouTube Handle" value={infData.youtubeHandle} onChange={e => setInfData({...infData, youtubeHandle: e.target.value})} />}

                            <input type="text" placeholder="Link to Rate Card (Optional)" value={infData.rateCard} onChange={e => setInfData({...infData, rateCard: e.target.value})} />
                        </>
                    )}

                    {/* NICHE SELECTOR */}
                    <div className="niche-selector">
                        <label style={{color:'white', fontWeight:'600', marginBottom:'10px', display:'block'}}>Select Niches (Max 5)</label>
                        <div className="niche-pills">
                            {COMMON_NICHES.map(n => (
                                <span key={n} className={`niche-pill ${currentNiches.includes(n) ? 'active' : ''}`} onClick={() => toggleNiche(n)}>{n}</span>
                            ))}
                            {currentNiches.filter(n => !COMMON_NICHES.includes(n)).map(n => (
                                <span key={n} className="niche-pill active" onClick={() => toggleNiche(n)}>{n} ✕</span>
                            ))}
                        </div>
                        <div className="custom-niche-input" style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                            <input type="text" placeholder="Add custom niche..." value={customNiche} onChange={e => setCustomNiche(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomNiche(e)} />
                            <button type="button" className="btn-primary" onClick={addCustomNiche} style={{padding:'8px 16px', fontSize:'0.9rem'}}>Add</button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading}>{isLoading ? 'Syncing...' : 'Complete Setup'}</button>
                </form>
            </div>
        </div>
        </>
    );
}