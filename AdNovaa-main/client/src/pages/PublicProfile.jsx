import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; 
import "../styles/InfluencerDashboard.css"; 

const DEFAULT_PFP = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
        try {
            const userRes = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
            const userData = await userRes.json();
            const postsRes = await fetch(`http://localhost:5000/api/posts/user/${userId}`);
            const postsData = await postsRes.json();

            if (userData.success) setUser(userData.user);
            if (postsData.success) setPosts(postsData.posts);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [userId]);

  const handleMessage = () => {
      if(user) navigate("/messages", { state: { initiateChat: user.email } });
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>Loading...</div>;
  if (!user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>User not found.</div>;

  const isBiz = user.role === 'business';

  // --- 1. INFLUENCER LAYOUT ---
  if (!isBiz) {
      const profile = user.influencerProfile || {};
      return (
        <>
          <Navbar />
          <div className="inf-wrapper">
            <div className="inf-container">
               <aside className="inf-sidebar">
                  <div className="pfp-container">
                      <div className="pfp-circle" style={{backgroundImage: `url(${getImgUrl(profile.pfp)})`}}></div>
                  </div>
                  <div className="inf-info">
                      <h2 className="inf-name">{profile.displayName || user.name}</h2>
                      <p className="inf-location">📍 {profile.location || "Global"}</p>
                      <div className="inf-badge">{profile.niche || "Creator"}</div>
                      <p className="inf-bio">{profile.bio || "No bio available."}</p>
                      
                      {/* --- VERIFIED SOURCES DISPLAY --- */}
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

                      <button className="btn-primary w-100 mt-4" onClick={handleMessage}>Message</button>
                  </div>
                  <div className="inf-stats">
                      <div className="stat-box">
                          <div className="stat-num">{formatCompactNumber(profile.followerCount || 0)}</div>
                          <div className="stat-label">Total Reach</div>
                      </div>
                  </div>
               </aside>
               <main className="inf-content">
                  <h3 className="section-title">Portfolio</h3>
                  <div className="masonry-container">
                      {posts.map((p) => (
                          <div key={p._id} className="masonry-item post-card">
                              <img src={getImgUrl(p.image)} alt="post" />
                              <div className="post-overlay">
                                  <h5 style={{margin:0}}>{p.header}</h5>
                                  <small className="text-muted">{p.caption}</small>
                              </div>
                          </div>
                      ))}
                  </div>
               </main>
            </div>
          </div>
        </>
      );
  }

  // --- 2. BUSINESS LAYOUT ---
  const profile = user.businessProfile || {};
  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        <div className="bizdash-header-container" data-aos="fade-down">
           <div className="bizdash-cover" style={{ backgroundImage: `url(${getImgUrl(profile.coverUrl)})` }}></div>
           <div className="bizdash-profile-bar">
              <div className="logo-wrapper">
                  <img src={getImgUrl(profile.logoUrl)} className="bizdash-logo" alt="profile" />
              </div>
              <div className="profile-text">
                  <h2>{profile.brandName || user.name}</h2>
                  <p style={{color:'#0dcaf0'}}>{profile.industry} • {profile.location}</p>
                  <button className="btn-primary mt-3" onClick={handleMessage}>Message Business</button>
              </div>
           </div>
        </div>
        <div className="bizdash-content">
            <aside className="biz-details-card">
                <h4>About</h4>
                <div className="detail-row"><strong>Role</strong> Business</div>
                <div className="detail-row"><strong>Website</strong> <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>{profile.websiteUrl || "N/A"}</a></div>
                <div className="detail-bio"><strong>Target Audience:</strong><br/> {profile.targetAudience || "No details."}</div>
            </aside>
            <main className="biz-posts-area">
                <h3>Recent Campaigns</h3>
                <div className="masonry-container">
                    {posts.map((p) => (
                        <div key={p._id} className="masonry-item post-card">
                            <img src={getImgUrl(p.image)} alt="post" />
                            <div className="post-overlay">
                                <h5 style={{margin:0}}>{p.header}</h5>
                                <small className="text-muted">{p.caption}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
      </div>
    </>
  );
}