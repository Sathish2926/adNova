import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import "../styles/InfluencerDashboard.css";
import Navbar from '../components/navbar';

const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image"

export default function InfluencerDashboard() {
    const { userId, role } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    const [profile, setProfile] = useState({
        name: '', categories: '', location: '', bio: '',
        subscribers: '0', followers: '0', pfp: '', 
        niche: '', rateCard: '',
    });

    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({ img: '', header: '', caption: '' });

    // --- FETCH PROFILE ---
    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }
        const fetchProfile = async () => {
            try {
                const response = await fetch(PROFILE_FETCH_URL(userId));
                const data = await response.json();
                if (response.ok && data.success) {
                    const userData = data.user;
                    const influencerData = userData.influencerProfile || {};
                    setProfile({
                        name: userData.name,
                        location: influencerData.location || 'Location', 
                        bio: influencerData.bio || 'Bio...', 
                        niche: influencerData.niche || 'Niche',
                        categories: influencerData.niche ? influencerData.niche.toUpperCase() : 'NICHE',
                        followers: influencerData.followerCount ? `${(influencerData.followerCount).toLocaleString()}` : '0',
                        subscribers: influencerData.followerCount ? `${(influencerData.followerCount / 1000).toFixed(1)}K` : '0',
                        pfp: influencerData.pfp || 'https://via.placeholder.com/150',
                        rateCard: influencerData.rateCard || '',
                    });
                }
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchProfile();
    }, [userId]);

    // --- HANDLERS ---
    const uploadPfp = async (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        setProfile(p => ({...p, pfp: URL.createObjectURL(file)}));
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('role', role);
        formData.append('fieldName', 'pfp');

        try {
            await fetch(UPLOAD_API_URL, { method: 'POST', body: formData });
        } catch (error) { console.error(error); }
    };

    const uploadPostImage = (e) => {
        const f = e?.target?.files?.[0];
        if (!f) return;
        setNewPost(p=>({...p, img: URL.createObjectURL(f)}));
    };
    
    const submitPostToAPI = async () => {
        if (!newPost.img) return;
        setPosts(p => [newPost, ...p]);
        setNewPost({ img:'', header:'', caption:''});
        setShowPostForm(false);
    };

    const handleSaveProfile = async () => {
        setEditMode(false);
        const updateData = {
            userId: userId, role: role,
            profileData: {
                displayName: profile.name, niche: profile.niche,
                location: profile.location, bio: profile.bio,
                rateCard: profile.rateCard, pfp: profile.pfp,
            }
        };
        try {
            await fetch(PROFILE_UPDATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
        } catch (error) { setEditMode(true); }
    };

    if (isLoading) return <div style={{color:'white', textAlign:'center', marginTop:'100px'}}>Loading Profile...</div>;

    return (
        <>
            <Navbar />
            <div className='profile-wrapper-react container'>
                <div className='profile-section-react'>
                    {/* LEFT SIDEBAR */}
                    <aside className='profile-left-react'>
                        <div className='pfp-area'>
                            <div className='pfp-box' style={{backgroundImage:`url(${profile.pfp})`}} onClick={()=>editMode && document.getElementById('pfpUpload')?.click()} />
                            <input id='pfpUpload' type='file' hidden onChange={uploadPfp} />
                        </div>
                        
                        {editMode ? (
                            <>
                                <input className='edit-input' value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} />
                                <input className='edit-input' placeholder="Location" value={profile.location} onChange={(e) => setProfile(p => ({...p, location: e.target.value}))} />
                                <textarea className='edit-textarea' value={profile.bio} onChange={(e) => setProfile(p => ({...p, bio: e.target.value}))} />
                            </>
                        ) : (
                            <>
                                <h2 className='name-react'>{profile.name}</h2>
                                <p className='loc-react'>📍 {profile.location}</p>
                                <p className='bio-react'>{profile.bio}</p>
                            </>
                        )}
                        <div className='counts-react mt-3'>
                            <div className='count-col'><div className='count-num'>{profile.subscribers}</div><div className='count-label'>Subscribers</div></div>
                            <div className='count-col'><div className='count-num'>{profile.followers}</div><div className='count-label'>Followers</div></div>
                        </div>
                    </aside>

                    {/* POSTS SECTION */}
                    <main className='posts-section-react'>
                        <div className='posts-top-react'>
                            <h3 className='text-white'>Posts</h3>
                        </div>

                        <div className='masonry-react'>
                             {/* 🚨 FIX: ALWAYS VISIBLE */}
                            <div className='new-post-placeholder' onClick={()=>setShowPostForm(true)}>
                                <div className='new-post-plus'>+</div>
                                <div style={{fontWeight:'500', letterSpacing:'1px'}}>New Post</div>
                            </div>

                            {posts.map((p,i)=>(
                                <div className='post-tile' key={i}>
                                    <img src={p.img} alt={p.header} />
                                    {editMode && <button className='delete-btn-react' onClick={()=>setPosts(posts.filter((_,idx)=>idx!==i))}>✕</button>}
                                    <div className='post-hover-react'><div style={{fontWeight:'bold'}}>{p.header}</div><div>{p.caption}</div></div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {/* MODAL */}
                {showPostForm && (
                    <div className='post-form-overlay-react' onClick={()=>setShowPostForm(false)}>
                        <div className='post-form-react' onClick={(e)=>e.stopPropagation()}>
                            <h3>New Post</h3>
                            <input type='file' accept='image/*' onChange={uploadPostImage} />
                            {newPost.img && <img className='preview-react' src={newPost.img} alt='preview' />}
                            <input className='edit-input mt-2' placeholder='Header' value={newPost.header} onChange={(e)=>setNewPost({...newPost, header:e.target.value})} />
                            <input className='edit-input mt-2' placeholder='Caption' value={newPost.caption} onChange={(e)=>setNewPost({...newPost, caption:e.target.value})} />
                            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                                <button className='btn-primary' onClick={submitPostToAPI}>Save</button>
                                <button className='btn-primary' style={{background:'transparent', border:'1px solid white'}} onClick={()=>setShowPostForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FLOATING EDIT BUTTON */}
                <button className='floating-edit-react' onClick={() => { if(editMode) handleSaveProfile(); else setEditMode(true); }}>
                    {editMode ? "✓" : "✎"}
                </button>
            </div>
        </>
    );
}