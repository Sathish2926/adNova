import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; 

const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image";
const CREATE_POST_URL = "http://localhost:5000/api/posts/create"; 
const USER_POSTS_URL = (userId) => `http://localhost:5000/api/posts/user/${userId}`; 
const DEFAULT_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

export default function BusinessDashboard() {
  const { userId, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  const [business, setBusiness] = useState({ name: "", tag: "", description: "", owner: "", email: "", phone: "", website: "", logo: "", cover: "" });
  const [posts, setPosts] = useState([]); 
  const [newPost, setNewPost] = useState({ img: "", header: "", caption: "" });

  const getImgUrl = (path) => {
    if (!path) return DEFAULT_LOGO;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  useEffect(() => { 
    AOS.init({ duration: 900 }); 
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
                        logo: biz.logoUrl || DEFAULT_LOGO, 
                        cover: biz.coverUrl || "https://via.placeholder.com/1200x350", 
                    });
                }
            })
            .catch(err => console.error(err));
        
        fetch(USER_POSTS_URL(userId))
            .then(res => res.json())
            .then(data => { if(data.success) setPosts(data.posts); })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }
  }, [userId]);

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setBusiness(prev => ({ ...prev, [fieldName === 'logoUrl' ? 'logo' : 'cover']: objectUrl }));
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    formData.append('role', role);
    formData.append('fieldName', fieldName);
    fetch(UPLOAD_API_URL, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => { if(data.success) setBusiness(prev => ({ ...prev, [fieldName === 'logoUrl' ? 'logo' : 'cover']: data.fileUrl })); });
  };

  const handleRemoveLogo = () => { if(window.confirm("Remove logo?")) setBusiness(prev => ({ ...prev, logo: DEFAULT_LOGO })); };

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
        if (data.success) {
            setPosts([data.post, ...posts]);
            setNewPost({ img: "", header: "", caption: "" });
            setShowPostForm(false);
        }
    } catch (err) { console.error(err); }
  };

  const saveProfile = async () => {
      setEditing(false);
      const logoToSend = business.logo === DEFAULT_LOGO ? "" : business.logo;
      try {
          await fetch(PROFILE_UPDATE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, role, profileData: {
                  brandName: business.name, ownerName: business.owner, phoneNumber: business.phone,
                  websiteUrl: business.website, logoUrl: logoToSend, coverUrl: business.cover,
              }})
          });
      } catch (err) { console.error(err); }
  };

  if (isLoading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        <div className="bizdash-header-container" data-aos="fade-down">
          <div className="bizdash-cover" style={{ backgroundImage: `url(${getImgUrl(business.cover)})` }}>
            {editing && <label className="edit-cover-btn">Change Cover <input type="file" hidden onChange={(e) => handleImageUpload(e, 'coverUrl')} /></label>}
          </div>
          <div className="bizdash-profile-bar">
            <div className="logo-wrapper">
              <img src={getImgUrl(business.logo)} className="bizdash-logo" alt="logo" />
              {editing && (
                 <div className="logo-edit-actions">
                    <label className="logo-action-btn edit">✎ <input type="file" hidden onChange={(e) => handleImageUpload(e, 'logoUrl')} /></label>
                    <button className="logo-action-btn remove" onClick={handleRemoveLogo}>✕</button>
                 </div>
              )}
            </div>
            <div className="profile-text">
              {editing ? (
                <>
                  <input className="edit-mode-input" style={{fontSize: '1.8rem', fontWeight: 'bold'}} value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} placeholder="Brand Name" />
                  <input className="edit-mode-input" value={business.tag} onChange={(e) => setBusiness({ ...business, tag: e.target.value })} placeholder="Industry • Location" />
                </>
              ) : (
                <><h2>{business.name}</h2><p>{business.tag}</p></>
              )}
            </div>
          </div>
        </div>

        <div className="bizdash-content">
          <aside className="biz-details-card glass-panel" data-aos="fade-right">
            <h4>About Business</h4>
            {editing ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <input className="edit-mode-input" placeholder="Owner" value={business.owner} onChange={(e) => setBusiness({ ...business, owner: e.target.value })} />
                <input className="edit-mode-input" placeholder="Phone" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
                <input className="edit-mode-input" placeholder="Website" value={business.website} onChange={(e) => setBusiness({ ...business, website: e.target.value })} />
                <textarea rows="5" placeholder="Description" value={business.description} onChange={(e) => setBusiness({ ...business, description: e.target.value })} />
              </div>
            ) : (
              <>
                <div className="detail-row"><strong>Owner</strong> {business.owner}</div>
                <div className="detail-row"><strong>Contact</strong> {business.phone || "N/A"}</div>
                <div className="detail-row"><strong>Website</strong> <a href={business.website} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>{business.website || "N/A"}</a></div>
                <div className="detail-bio">{business.description}</div>
              </>
            )}
          </aside>
          <main className="biz-posts-area" data-aos="fade-left">
            <h3>Recent Campaigns</h3>
            <div className="masonry-container"> 
              <div className="masonry-item" onClick={() => setShowPostForm(true)}>
                 <div className="new-post-btn">
                    <span style={{fontSize: '3rem', fontWeight: '200', lineHeight:'1', marginBottom:'15px'}}>+</span>
                    <span style={{fontWeight:'600', letterSpacing:'1px'}}>CREATE POST</span>
                 </div>
              </div>
              {posts.map((p, i) => (
                <div className="masonry-item post-card glass-card" key={i}>
                  <img src={getImgUrl(p.image)} alt="post" />
                  <div className="post-overlay">
                    <h5 style={{color:'white', margin:'0 0 5px 0'}}>{p.header}</h5>
                    <small style={{color:'#e2e8f0'}}>{p.caption}</small>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
        <button className="fab-edit" onClick={() => editing ? saveProfile() : setEditing(true)}>{editing ? "✓" : "✎"}</button>
        
        {/* --- MODAL WITH FIXED FILE UPLOAD UI --- */}
        {showPostForm && (
          <div className="post-form-overlay" onClick={() => setShowPostForm(false)}>
            <div className="post-form-container glass-panel" onClick={e => e.stopPropagation()}>
               <h3 style={{marginBottom:'20px', color:'white'}}>Create New Post</h3>
               
<div className="file-upload-wrapper">
    <input type="file" accept="image/*" id="inf-post-upload" hidden onChange={handleNewPostImage} />
    <label htmlFor="inf-post-upload" className="file-upload-label">
        {newPost.img ? (
            <img src={getImgUrl(newPost.img)} className="preview-img" alt="preview" />
        ) : (
            <div className="upload-placeholder">
                <span style={{fontSize:'2rem'}}>📁</span>
                <span>Click to Upload Image</span>
            </div>
        )}
    </label>
</div>

               <input className="edit-mode-input" placeholder="Header" value={newPost.header} onChange={e => setNewPost({...newPost, header: e.target.value})} />
               <input className="edit-mode-input" placeholder="Caption" value={newPost.caption} onChange={e => setNewPost({...newPost, caption: e.target.value})} />
               <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
                  <button className="btn-primary" style={{flex:1}} onClick={addPost}>Post</button>
                  <button className="btn-primary" style={{flex:1, background:'transparent', border:'1px solid white'}} onClick={() => setShowPostForm(false)}>Cancel</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}