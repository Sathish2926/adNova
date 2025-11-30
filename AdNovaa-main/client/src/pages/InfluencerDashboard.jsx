import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/navbar';
import "../styles/InfluencerDashboard.css"; 

const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image";
const CREATE_POST_URL = "http://localhost:5000/api/posts/create"; 
const USER_POSTS_URL = (userId) => `http://localhost:5000/api/posts/user/${userId}`;
const REFRESH_STATS_URL = "http://localhost:5000/api/auth/refresh-socials";

const DEFAULT_PFP = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

export default function InfluencerDashboard() {
    const { userId, role } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    
    const [profile, setProfile] = useState({
        name: '', niche: '', location: '', bio: '', followers: 0, 
        pfp: '', rateCard: '', instagramHandle: '', youtubeHandle: ''
    });
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ img: '', header: '', caption: '' });

    const formatCompactNumber = (number) => {
        const num = Number(number);
        if (isNaN(num)) return "0";
        return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const getImgUrl = (path) => {
        if (!path) return DEFAULT_PFP;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    useEffect(() => {
        AOS.init({ duration: 900 });
        if (userId) {
            fetch(PROFILE_FETCH_URL(userId))
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const user = data.user;
                        const inf = user.influencerProfile || {};
                        
                        setProfile({
                            name: inf.displayName || user.name || "Influencer Name",
                            niche: inf.niche || "Content Creator",
                            location: inf.location || "Location", 
                            bio: inf.bio || "No bio added yet.", 
                            followers: inf.followerCount || 0,
                            pfp: inf.pfp || DEFAULT_PFP,
                            rateCard: inf.rateCard || '',
                            instagramHandle: inf.instagramHandle || '',
                            youtubeHandle: inf.youtubeHandle || ''
                        });
                    }
                }).catch(err => console.error(err));

            fetch(USER_POSTS_URL(userId))
                .then(res => res.json())
                .then(data => { if(data.success) setPosts(data.posts); })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [userId]);

    const handleRefreshStats = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch(REFRESH_STATS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.success) {
                setProfile(prev => ({ ...prev, followers: data.count }));
                alert(`Stats Updated: ${formatCompactNumber(data.count)}`);
            } else {
                alert(data.message);
            }
        } catch (err) { console.error(err); } 
        finally { setIsRefreshing(false); }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfile(p => ({...p, pfp: URL.createObjectURL(file)}));
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('role', role);
        formData.append('fieldName', 'pfp');
        fetch(UPLOAD_API_URL, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => { if(data.success) setProfile(p => ({...p, pfp: data.fileUrl })); });
    };

    const handleNewPostImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('role', role);
        formData.append('fieldName', 'temp_post');
        fetch(UPLOAD_API_URL, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => { if(data.success) setNewPost({ ...newPost, img: data.fileUrl }); });
    };
    
    const addPost = async () => {
        if (!newPost.img) return;
        try {
            const res = await fetch(CREATE_POST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role, header: newPost.header, caption: newPost.caption, image: newPost.img })
            });
            const data = await res.json();
            if(data.success) {
                setPosts([data.post, ...posts]);
                setNewPost({ img:'', header:'', caption:''});
                setShowPostForm(false);
            }
        } catch(err) { console.error(err); }
    };

    const handleSaveProfile = async () => {
        setEditMode(false);
        const pfpToSend = profile.pfp === DEFAULT_PFP ? "" : profile.pfp;
        
        try {
            await fetch(PROFILE_UPDATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role, profileData: {
                    displayName: profile.name, 
                    niche: profile.niche, 
                    location: profile.location, 
                    bio: profile.bio, 
                    pfp: pfpToSend,
                    instagramHandle: profile.instagramHandle,
                    youtubeHandle: profile.youtubeHandle
                }}),
            });
            if(profile.instagramHandle || profile.youtubeHandle) handleRefreshStats();
        } catch (error) { console.error(error); }
    };

    if (isLoading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>Loading...</div>;

    return (
        <>
            <Navbar />
            <div className='inf-wrapper'>
                <div className='inf-container'>
                    <aside className='inf-sidebar glass-panel' data-aos="fade-right">
                        <div className='pfp-container'>
                            <div className='pfp-circle' style={{backgroundImage:`url(${getImgUrl(profile.pfp)})`}}>
                                {editMode && (
                                    <label className='pfp-edit-overlay'>✎ <input type='file' hidden onChange={handleImageUpload} /></label>
                                )}
                            </div>
                        </div>
                        <div className='inf-info'>
                            {editMode ? (
                                <>
                                    <input className='edit-input' value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} placeholder="Name" />
                                    <input className='edit-input' value={profile.location} onChange={(e) => setProfile(p => ({...p, location: e.target.value}))} placeholder="Location" />
                                    <input className='edit-input' value={profile.niche} onChange={(e) => setProfile(p => ({...p, niche: e.target.value}))} placeholder="Niche" />
                                    <textarea className='edit-textarea' value={profile.bio} onChange={(e) => setProfile(p => ({...p, bio: e.target.value}))} placeholder="Bio" />
                                    
                                    <div style={{marginTop:'15px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'10px'}}>
                                        <label style={{fontSize:'0.8rem', color:'#94a3b8', display:'block', marginBottom:'5px'}}>Social Handles (No @)</label>
                                        <input className='edit-input' value={profile.instagramHandle} onChange={(e) => setProfile(p => ({...p, instagramHandle: e.target.value}))} placeholder="Instagram (e.g. adnova)" />
                                        <input className='edit-input' value={profile.youtubeHandle} onChange={(e) => setProfile(p => ({...p, youtubeHandle: e.target.value}))} placeholder="YouTube (e.g. adnova_official)" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className='inf-name'>{profile.name}</h2>
                                    <p className='inf-location'>📍 {profile.location}</p>
                                    <div className='inf-badge'>{profile.niche}</div>
                                    <p className='inf-bio'>{profile.bio}</p>

                                    {/* --- NEW: VERIFIED SOURCES DISPLAY --- */}
                                    {(profile.instagramHandle || profile.youtubeHandle) && (
                                        <div style={{textAlign:'center', marginTop:'15px'}}>
                                            <span className="social-label">Verified Sources</span>
                                            <div className="connected-socials">
                                                {profile.instagramHandle && (
                                                    <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noreferrer" className="social-badge insta">
                                                        <i className="fa-brands fa-instagram"></i> @{profile.instagramHandle}
                                                    </a>
                                                )}
                                                {profile.youtubeHandle && (
                                                    <a href={`https://youtube.com/@${profile.youtubeHandle}`} target="_blank" rel="noreferrer" className="social-badge yt">
                                                        <i className="fa-brands fa-youtube"></i> @{profile.youtubeHandle}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className='inf-stats'>
                            <div className='stat-box'>
                                <div className='stat-num-row'>
                                    <span className='stat-num'>{formatCompactNumber(profile.followers)}</span>
                                    <button className={`sync-btn ${isRefreshing ? 'spinning' : ''}`} onClick={handleRefreshStats} title="Sync Followers" disabled={isRefreshing}>↻</button>
                                </div>
                                <div className='stat-label'>Total Reach</div>
                            </div>
                        </div>
                    </aside>

                    <main className='inf-content' data-aos="fade-left">
                        <h3 className='section-title'>My Content Portfolio</h3>
                        <div className='masonry-container'>
                            <div className='masonry-item' style={{display:'inline-block', width:'100%'}}>
                                <div className='new-post-tile' onClick={()=>setShowPostForm(true)}>
                                    <div className='plus-icon'>+</div><div>Add New Content</div>
                                </div>
                            </div>
                            {posts.map((p,i)=>(
                                <div className='masonry-item post-card glass-card' key={i}>
                                    <img src={getImgUrl(p.image)} alt={p.header} />
                                    <div className='post-overlay'>
                                        <h5 style={{color:'white', margin:0}}>{p.header}</h5>
                                        <small style={{color:'#e2e8f0'}}>{p.caption}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {showPostForm && (
                    <div className='post-form-overlay' onClick={()=>setShowPostForm(false)}>
                        <div className='post-form-container glass-panel' onClick={(e)=>e.stopPropagation()}>
                            <h3 style={{marginBottom:'20px', color:'white'}}>Add to Portfolio</h3>
                            <div className="file-upload-wrapper">
                                <input type="file" accept="image/*" id="inf-post-upload" hidden onChange={handleNewPostImage} />
                                <label htmlFor="inf-post-upload" className="file-upload-label">
                                    {newPost.img ? <img src={getImgUrl(newPost.img)} className="preview-img" alt="preview" /> : <div className="upload-placeholder"><span style={{fontSize:'2rem'}}>📁</span><span>Click to Upload Image</span></div>}
                                </label>
                            </div>
                            <input className='edit-input' placeholder='Title' value={newPost.header} onChange={(e)=>setNewPost({...newPost, header:e.target.value})} />
                            <input className='edit-input' placeholder='Description' value={newPost.caption} onChange={(e)=>setNewPost({...newPost, caption:e.target.value})} />
                            <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
                                <button className='btn-primary' style={{flex:1}} onClick={addPost}>Post</button>
                                <button className='btn-primary' style={{flex:1, background:'transparent', border:'1px solid white'}} onClick={()=>setShowPostForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                <button className='fab-edit' onClick={() => { if(editMode) handleSaveProfile(); else setEditMode(true); }}>{editMode ? "✓" : "✎"}</button>
            </div>
        </>
    );
}