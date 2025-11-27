import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 1. Import Auth
import "../styles/InfluencerDashboard.css";
import Navbar from '../components/navbar';

// Placeholder URL - Ensure your API URLs are correct
const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image"
// 🚨 NOTE: You'll need a separate endpoint for file uploads!

export default function InfluencerDashboard() {
    const { userId, role } = useAuth(); // Get user ID and role
    const [isLoading, setIsLoading] = useState(true);
    
    // Initial state based on your current local mock data and schema fields
    const [profile, setProfile] = useState({
        name: '', categories: '', location: '', bio: '',
        subscribers: '0', followers: '0', pfp: '', 
        // Fields for editing:
        niche: '', // Maps to categories
        rateCard: '', // Assuming you will add this to the profile later
    });

    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({ img: '', header: '', caption: '' });

    // --- FETCH PROFILE DATA ON LOAD (Dynamic Dashboard Logic) ---
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch(PROFILE_FETCH_URL(userId));
                const data = await response.json();

                if (response.ok && data.success) {
                    const userData = data.user;
                    const influencerData = userData.influencerProfile || {};

                    setProfile({
                        // Core User Info
                        name: userData.name,
                        location: influencerData.location || 'N/A', 
                        bio: influencerData.bio || 'Please update your bio.', 
                        
                        // Influencer Profile Data
                        niche: influencerData.niche || 'N/A',
                        categories: influencerData.niche ? influencerData.niche.toUpperCase() : 'N/A',
                        followers: influencerData.followerCount ? `${(influencerData.followerCount).toLocaleString()}` : '0',
                        subscribers: influencerData.followerCount ? `${(influencerData.followerCount / 1000).toFixed(1)}K` : '0',
                        pfp: influencerData.pfp || 'default-avatar-url.jpg',
                        rateCard: influencerData.rateCard || '',
                        // NOTE: You'll need a separate fetch here for posts based on IDs
                    });
                    
                    // setPosts(fetched posts/portfolio here); 
                }
            } catch (error) {
                console.error("Error fetching influencer profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    // --- HANDLERS ---

    // 🚨 TO DO: Implement File Upload Logic (Requires Multer on backend)
  const uploadPfp = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Use FormData to send the file to the server
    const formData = new FormData();
    formData.append('image', file); // 'image' must match the Multer key in the router: upload.single('image')
    formData.append('userId', userId);
    formData.append('role', role);
    formData.append('fieldName', 'pfp'); // The field in the database to update

    // Show local preview immediately (optional)
    setProfile(p => ({...p, pfp: URL.createObjectURL(file)})); 

    try {
        const response = await fetch(UPLOAD_API_URL, {
            method: 'POST',
            body: formData, // Do NOT set 'Content-Type': 'multipart/form-data'; fetch does it automatically
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update state with the permanent URL returned from the server
            setProfile(p => ({...p, pfp: data.fileUrl})); 
            alert("Profile Picture uploaded!");
        } else {
            alert(`Upload failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Network error during file upload.");
    }
};
    const uploadPostImage = (e) => {
        const f = e?.target?.files?.[0];
        if (!f) return;
        setNewPost(p=>({...p, img: URL.createObjectURL(f)}));
    };
    
    // 3. API CALL: Submit a new post/portfolio entry
    const submitPostToAPI = async () => {
        if (!newPost.img || !newPost.header) return;

        // 🚨 IMPORTANT: You must upload the image file FIRST.
        // Assume uploadPostImage() stores the file on the server and returns the final URL.
        
        // MOCK API Call for saving the post
        try {
            // const postResponse = await fetch('/api/posts/add', { ... });
            
            // If successful, update local state:
            setPosts(p => [newPost, ...p]);
            setNewPost({ img:'', header:'', caption:''});
            setShowPostForm(false);
            alert("Post submitted successfully!");

        } catch (error) {
            console.error("Error submitting post:", error);
            alert("Failed to submit post.");
        }
    };

    // 4. API CALL: Save Profile Details
    const handleSaveProfile = async () => {
        setEditMode(false); // Optimistically turn off edit mode

        // 🚨 NOTE: The profile state now contains fields like name, niche, location, bio, etc.
        const updateData = {
            userId: userId,
            role: role,
            // Construct the profile data payload that matches the backend schema fields (businessProfile/influencerProfile)
            profileData: {
                displayName: profile.name, // Use name for display name
                niche: profile.niche,
                location: profile.location, // Assuming you add this to the Influencer Schema
                bio: profile.bio, // Assuming you add this to the Influencer Schema
                // You would typically calculate followers/subscribers from external APIs, 
                // but for now, we leave them out of the update payload.
                rateCard: profile.rateCard,
                pfp: profile.pfp, // This should be the final URL after uploading the file (not the local URL)
            }
        };

        try {
            const response = await fetch(PROFILE_UPDATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                alert("Profile saved successfully!");
            } else {
                alert(`Error saving profile: ${data.message}`);
                setEditMode(true); // Re-enable edit mode if saving failed
            }
        } catch (error) {
            console.error("Network error saving profile:", error);
            alert("Failed to connect to the server to save profile.");
            setEditMode(true);
        }
    };


    // 5. Update Edit Toggle to use Save Handler
    const handleEditToggle = () => {
        if (editMode) {
            handleSaveProfile(); // Save when transitioning from Edit to View
        } else {
            setEditMode(true); // Enter Edit mode
        }
    };
    
    // --- JSX RENDER ---

    if (isLoading) {
        return <div className="loading-spinner">Loading Profile...</div>;
    }

    return (
        <>
            <Navbar />
            <div className='profile-wrapper-react container'>
                <div className='profile-section-react'>
                    <aside className='profile-left-react'>
                        {/* PFP and Editable Inputs */}
                        <div className='pfp-area'>
                            <div className='pfp-box' style={{backgroundImage:`url(${profile.pfp})`}} onClick={()=>editMode && document.getElementById('pfpUpload')?.click()} />
                            <input id='pfpUpload' type='file' hidden onChange={uploadPfp} />
                        </div>
                        
                        {/* Name Input */}
                        {editMode ? (
                            <input className='name-input' value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} />
                        ) : (
                            <h2 className='name-react'>{profile.name}</h2>
                        )}
                        
                        <p className='cat-text-react'>{profile.categories}</p>
                        
                        {/* Location Input */}
                        {editMode ? (
                            <input className='input-default' value={profile.location} onChange={(e) => setProfile(p => ({...p, location: e.target.value}))} />
                        ) : (
                            <p className='loc-react'>📍 {profile.location}</p>
                        )}

                        {/* Bio Input */}
                        {editMode ? (
                            <textarea className='textarea-default' value={profile.bio} onChange={(e) => setProfile(p => ({...p, bio: e.target.value}))} />
                        ) : (
                            <p className='bio-react'>{profile.bio}</p>
                        )}
                        
                        {/* Rate Card Input (New Field) */}
                        {editMode && (
                            <input className='input-default mt-2' placeholder='Rate Card Link' value={profile.rateCard} onChange={(e) => setProfile(p => ({...p, rateCard: e.target.value}))} />
                        )}

                        <div className='counts-react mt-3'>
                            <div className='count-col'><div className='count-num'>{profile.subscribers}</div><div className='count-label'>Subscribers</div></div>
                            <div className='count-col'><div className='count-num'>{profile.followers}</div><div className='count-label'>Followers</div></div>
                        </div>
                    </aside>

                    <main className='posts-section-react'>
                        <div className='posts-top-react d-flex justify-content-between align-items-center'>
                            <h3 className='text-white'>Posts</h3>
                            <div>
                                {editMode && <button className='btn btn-sm btn-danger me-2' onClick={()=>setPosts([])}>Clear</button>}
                                <button className='btn btn-sm btn-primary' onClick={()=>setShowPostForm(true)}>New Post</button>
                            </div>
                        </div>

                        {/* ... (Posts mapping remains the same) ... */}
                        <div className='masonry-react mt-3'>
                            {posts.map((p,i)=>(
                                <div className='post-tile' key={i}>
                                    <img src={p.img} alt={p.header} />
                                    {editMode && <button className='delete-btn-react' onClick={()=>setPosts(posts.filter((_,idx)=>idx!==i))}>✕</button>}
                                    <div className='post-hover-react'><div className='post-head-react'>{p.header}</div><div className='post-cap-react'>{p.caption}</div></div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {showPostForm && (
                    <div className='post-form-overlay-react' onClick={()=>setShowPostForm(false)}>
                        <div className='post-form-react' onClick={(e)=>e.stopPropagation()}>
                            <h3>New Post</h3>
                            <input type='file' accept='image/*' onChange={uploadPostImage} />
                            {newPost.img && <img className='preview-react' src={newPost.img} alt='preview' />}
                            <input className='input-default mt-2' placeholder='Header' value={newPost.header} onChange={(e)=>setNewPost({...newPost, header:e.target.value})} />
                            <input className='input-default mt-2' placeholder='Caption' value={newPost.caption} onChange={(e)=>setNewPost({...newPost, caption:e.target.value})} />
                            <div className='form-row-react mt-3'>
                                <button className='btn btn-primary me-2' onClick={submitPostToAPI}>Save</button>
                                <button className='btn btn-secondary' onClick={()=>setShowPostForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. Updated Toggle Button */}
                <button className='floating-edit-react' onClick={handleEditToggle}>
                    {editMode ? 'Save' : 'Edit'}
                </button>
            </div>
        </>
    );
}
