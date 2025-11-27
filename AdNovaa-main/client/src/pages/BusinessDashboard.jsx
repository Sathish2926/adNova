import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import Auth
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; 

// API Endpoints
const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image";

const BusinessDashboard = () => {
  const { userId, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  
  // Dynamic State (Matches Backend Schema)
  const [business, setBusiness] = useState({
    name: "",
    tag: "", // Industry/Location combo
    description: "",
    owner: "",
    email: "",
    phone: "",
    website: "",
    logo: "", 
    cover: "", 
  });

  const [posts, setPosts] = useState([]); // In future, fetch these from backend
  const [newPost, setNewPost] = useState({ img: "", header: "", caption: "" });

  useEffect(() => { 
    AOS.init({ duration: 900 }); 
    
    // --- FETCH REAL DATA ---
    if (userId) {
        fetch(PROFILE_FETCH_URL(userId))
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    const user = data.user;
                    const biz = user.businessProfile || {};
                    
                    setBusiness({
                        name: biz.brandName || user.name || "Brand Name",
                        tag: `${biz.industry || 'Industry'} • ${biz.location || 'Location'}`,
                        description: biz.targetAudience ? `Targeting: ${biz.targetAudience}` : "No description added yet.",
                        owner: biz.ownerName || user.name,
                        email: user.email,
                        phone: biz.phoneNumber || "",
                        website: biz.websiteUrl || "",
                        logo: biz.logoUrl || "https://via.placeholder.com/150", // Fallback if empty
                        cover: biz.coverUrl || "https://via.placeholder.com/1200x350", // Fallback if empty
                    });
                }
            })
            .catch(err => console.error("Failed to load profile", err))
            .finally(() => setIsLoading(false));
    }
  }, [userId]);

  // --- IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Local Preview
    const objectUrl = URL.createObjectURL(file);
    setBusiness(prev => ({ ...prev, [fieldName === 'logoUrl' ? 'logo' : 'cover']: objectUrl }));

    // 2. Upload to Server
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    formData.append('role', role);
    formData.append('fieldName', fieldName); // 'logoUrl' or 'coverUrl'

    try {
        const res = await fetch(UPLOAD_API_URL, { method: 'POST', body: formData });
        const data = await res.json();
        if(data.success) {
            // Update with real server URL
            setBusiness(prev => ({ ...prev, [fieldName === 'logoUrl' ? 'logo' : 'cover']: data.fileUrl }));
        }
    } catch (err) {
        console.error("Upload failed", err);
    }
  };

  const handleNewPostImage = (e) => {
    const file = e.target.files[0];
    if(file) setNewPost({ ...newPost, img: URL.createObjectURL(file) });
  };

  const addPost = () => {
    if (!newPost.img) return;
    setPosts([newPost, ...posts]);
    setNewPost({ img: "", header: "", caption: "" });
    setShowPostForm(false);
  };

  // --- SAVE PROFILE ---
  const saveProfile = async () => {
      setEditing(false);
      
      // Split "Tag" back into Industry/Location if simple, or just save generic fields
      // For now, we update the main fields
      const payload = {
          userId, role,
          profileData: {
              brandName: business.name,
              ownerName: business.owner,
              phoneNumber: business.phone,
              websiteUrl: business.website,
              // We aren't splitting description/tag perfectly here, but saving what we can
              logoUrl: business.logo,
              coverUrl: business.cover
          }
      };

      try {
          await fetch(PROFILE_UPDATE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      } catch (err) { console.error("Save failed", err); }
  };

  if (isLoading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading Dashboard...</div>;

  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        
        {/* COVER */}
        <div className="bizdash-cover" style={{ backgroundImage: `url(${business.cover})` }}>
          {editing && (
            <label className="upload-cover-label">
              Change Cover <input type="file" hidden onChange={(e) => handleImageUpload(e, 'coverUrl')} />
            </label>
          )}

          <div className="bizdash-container" style={{ width: '100%', padding: 0 }}>
             <div className="bizdash-profile-info">
              {/* LOGO */}
              <div className="logo-wrapper">
                <img src={business.logo} className="bizdash-logo" alt="logo" />
                {editing && (
                  <label className="upload-logo-label">
                    Change Logo <input type="file" hidden onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                  </label>
                )}
              </div>

              <div className="profile-text">
                {editing ? (
                  <>
                    <input className="edit-input" style={{fontSize: '2rem', fontWeight: 'bold'}} value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
                    <input className="edit-input" value={business.tag} onChange={(e) => setBusiness({ ...business, tag: e.target.value })} placeholder="Industry • Location" />
                  </>
                ) : (
                  <>
                    <h2>{business.name}</h2>
                    <p>{business.tag}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS & CONTENT */}
        <div className="bizdash-container">
          <div className="bizdash-info-card">
            <h4>Business Details</h4>
            {editing ? (
              <div className="edit-grid">
                <input className="edit-input" placeholder="Owner" value={business.owner} onChange={(e) => setBusiness({ ...business, owner: e.target.value })} />
                {/* Email is typically read-only as it's the ID */}
                <input className="edit-input" placeholder="Email" value={business.email} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
                <input className="edit-input" placeholder="Phone" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
                <input className="edit-input" placeholder="Website" value={business.website} onChange={(e) => setBusiness({ ...business, website: e.target.value })} />
                <textarea className="edit-textarea" value={business.description} onChange={(e) => setBusiness({ ...business, description: e.target.value })} />
              </div>
            ) : (
              <div className="static-grid">
                <div><strong>Owner:</strong> {business.owner}</div>
                <div><strong>Email:</strong> {business.email}</div>
                <div><strong>Phone:</strong> {business.phone || "N/A"}</div>
                <div><strong>Website:</strong> {business.website || "N/A"}</div>
                <div style={{gridColumn: '1 / -1', marginTop: '10px', lineHeight: '1.6', color: '#cbd5e1'}}>{business.description}</div>
              </div>
            )}
          </div>

          <h3 className="posts-header">Recent Posts</h3>
          
          <div className="masonry-grid">
            
            {/* NEW POST TILE */}
            <div className="new-post-placeholder" onClick={() => setShowPostForm(true)}>
                <div className="new-post-plus">+</div>
                <div className="new-post-text">Create Post</div>
            </div>

            {posts.length > 0 ? posts.map((p, i) => (
              <div className="masonry-item" key={i}>
                <img src={p.img} alt="post" />
                <div className="post-hover">
                  <h5>{p.header}</h5>
                  <p>{p.caption}</p>
                </div>
              </div>
            )) : (
                !showPostForm && <div style={{color: '#666', gridColumn: 'span 2', padding: '20px'}}>No posts yet. Click "+" to start.</div>
            )}
          </div>
        </div>

        {/* FLOATING BUTTON */}
        <button className="floating-edit-btn" onClick={() => { if(editing) saveProfile(); else setEditing(true); }}>
          {editing ? "✓" : "✎"}
        </button>

        {showPostForm && (
          <div className="post-form-overlay" onClick={() => setShowPostForm(false)}>
            <div className="post-form" onClick={e => e.stopPropagation()}>
              <h3 style={{marginBottom:'20px'}}>Create New Post</h3>
              <input type="file" className="file-upload" onChange={handleNewPostImage} />
              {newPost.img && <img src={newPost.img} className="preview-img" alt="preview" />}
              <input className="edit-input" placeholder="Header" value={newPost.header} onChange={e => setNewPost({...newPost, header: e.target.value})} />
              <input className="edit-input" placeholder="Caption" value={newPost.caption} onChange={e => setNewPost({...newPost, caption: e.target.value})} />
              
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="btn-primary" style={{flex:1}} onClick={addPost}>Post</button>
                <button className="btn-primary" style={{flex:1, background:'transparent', border:'1px solid white'}} onClick={() => setShowPostForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default BusinessDashboard;