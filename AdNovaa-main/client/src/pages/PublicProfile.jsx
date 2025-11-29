import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; // Reuse existing styles

const DEFAULT_PFP = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- IMAGE URL HELPER ---
  const getImgUrl = (path) => {
    if (!path) return DEFAULT_PFP;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch User Info
            const userRes = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
            const userData = await userRes.json();
            
            // 2. Fetch User Posts
            const postsRes = await fetch(`http://localhost:5000/api/posts/user/${userId}`);
            const postsData = await postsRes.json();

            if (userData.success) setUser(userData.user);
            if (postsData.success) setPosts(postsData.posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [userId]);

  const handleMessage = () => {
      // Navigate to Messages and pass the email to start a chat
      if(user) {
          navigate("/messages", { state: { initiateChat: user.email } });
      }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>Loading Profile...</div>;
  if (!user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>User not found.</div>;

  // Determine Profile Data based on role
  const isBiz = user.role === 'business';
  const profile = isBiz ? user.businessProfile : user.influencerProfile;
  
  // Safe accessors
  const displayName = isBiz ? (profile.brandName || user.name) : (profile.displayName || user.name);
  const imagePath = isBiz ? profile.logoUrl : profile.pfp;
  const coverPath = profile.coverUrl;
  
  const subtitle = isBiz 
      ? `${profile.industry || 'Industry'} • ${profile.location || 'Location'}` 
      : `${profile.niche || 'Niche'} • ${profile.location || 'Location'}`;
      
  const bio = isBiz ? profile.targetAudience : profile.bio;

  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        
        {/* HEADER */}
        <div className="bizdash-header-container" data-aos="fade-down">
           {/* Cover */}
           <div className="bizdash-cover" style={{ backgroundImage: `url(${getImgUrl(coverPath)})` }}></div>
           
           {/* Profile Bar */}
           <div className="bizdash-profile-bar">
              <div className="logo-wrapper">
                  <img 
                    src={getImgUrl(imagePath)} 
                    className="bizdash-logo" 
                    alt="profile" 
                  />
              </div>
              
              <div className="profile-text">
                  <h2>{displayName}</h2>
                  <p>{subtitle}</p>
                  
                  <div className="mt-3">
                    <button className="btn-primary" onClick={handleMessage}>
                        <i className="fa-solid fa-paper-plane me-2"></i> 
                        Message {isBiz ? "Business" : "Influencer"}
                    </button>
                  </div>
              </div>
           </div>
        </div>

        {/* CONTENT GRID */}
        <div className="bizdash-content">
            
            {/* Sidebar */}
            <aside className="biz-details-card glass-panel" data-aos="fade-right">
                <h4>About</h4>
                <div className="detail-row"><strong>Role</strong> <span style={{textTransform:'capitalize'}}>{user.role}</span></div>
                {isBiz ? (
                     <>
                        <div className="detail-row"><strong>Website</strong> <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>{profile.websiteUrl || "N/A"}</a></div>
                        <div className="detail-bio"><strong>Target Audience:</strong><br/> {bio || "No details provided."}</div>
                     </>
                ) : (
                     <>
                        <div className="detail-row"><strong>Followers</strong> {Number(profile.followerCount).toLocaleString()}</div>
                        <div className="detail-bio">{bio || "No bio available."}</div>
                     </>
                )}
            </aside>

            {/* Posts Feed */}
            <main className="biz-posts-area" data-aos="fade-left">
                <h3>Posts</h3>
                {posts.length === 0 ? (
                    <p className="text-muted">No posts yet.</p>
                ) : (
                    <div className="masonry-container">
                        {posts.map((p) => (
                            <div key={p._id} className="masonry-item post-card glass-card">
                                <img src={getImgUrl(p.image)} alt="post" />
                                <div className="post-overlay">
                                    <h5 style={{color:'white', margin:0}}>{p.header}</h5>
                                    <small style={{color:'#ddd'}}>{p.caption}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
      </div>
    </>
  );
}