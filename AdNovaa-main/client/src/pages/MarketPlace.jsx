// ==============================
// FILE: client/src/pages/MarketPlace.jsx
// ==============================
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AOS from "aos"; 
import "aos/dist/aos.css"; 
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; 
import API_BASE_URL from "../apiConfig"; 

const DEFAULT_PLACEHOLDER = "https://via.placeholder.com/400x300?text=No+Image";
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

const COMMON_NICHES = [ "Fashion", "Beauty", "Tech", "Gaming", "Travel", "Food", "Fitness", "Health", "Lifestyle", "Parenting", "Business", "Entertainment" ];

export default function Marketplace() {
  const { userId, role } = useAuth(); 
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchName, setSearchName] = useState("");
  const [searchLoc, setSearchLoc] = useState("");
  const [searchNiche, setSearchNiche] = useState("");
  const [searchReach, setSearchReach] = useState("0");
  const [userLocation, setUserLocation] = useState("");

  const getImgUrl = (path) => {
      if (!path || path === "undefined") return DEFAULT_PLACEHOLDER;
      if (path.startsWith("http")) return path; 
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getAvatarUrl = (path) => {
      if (!path || path === "undefined") return DEFAULT_AVATAR;
      if (path.startsWith("http")) return path;
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const fetchPosts = async () => {
      setLoading(true);
      try {
          const params = new URLSearchParams();
          if (userId) params.append("userId", userId);
          params.append("viewerRole", role);
          if (userLocation) params.append("userLocation", userLocation); 
          if (searchName) params.append("search", searchName);
          if (searchLoc) params.append("location", searchLoc);
          if (searchNiche) params.append("niche", searchNiche);
          if (searchReach !== "0") params.append("minReach", searchReach);

          const res = await fetch(`${API_BASE_URL}/api/posts/feed?${params.toString()}`);
          const data = await res.json();
          if (data.success) setPosts(data.posts);
          else setPosts([]); 
      } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    
    const init = async () => {
        if(userId) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`);
                const data = await res.json();
                if(data.success) {
                    const loc = role === 'business' ? data.user.businessProfile?.location : data.user.influencerProfile?.location;
                    setUserLocation(loc || "");
                }
            } catch(e) {}
        }
        fetchPosts();
    };
    init();
  }, [userId, role]);

  // --- FIX: Refresh Animations when posts load ---
  useEffect(() => {
      setTimeout(() => AOS.refresh(), 500);
  }, [posts]);

  const handleSearch = (e) => { e.preventDefault(); fetchPosts(); };

  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        <div className="container" style={{maxWidth: '1200px', marginTop: '40px'}}>
          <div className="text-center mb-5 text-white" data-aos="fade-down">
            <h2 className="fw-bold display-5">Explore {role === 'business' ? 'Creators' : 'Opportunities'}</h2>
            <p className="lead" style={{color:'#cbd5e1'}}>Find your perfect match.</p>
          </div>

          <form className="search-bar-container" onSubmit={handleSearch} data-aos="fade-up">
              
              <div className="search-group">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input className="search-input-clean" placeholder="Search Name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              </div>

              <div className="search-divider"></div>

              <div className="search-group">
                <i className="fa-solid fa-location-dot search-icon"></i>
                <input className="search-input-clean" placeholder="Location..." value={searchLoc} onChange={(e) => setSearchLoc(e.target.value)} />
              </div>

              <div className="search-divider"></div>

              <div className="search-group">
                <i className="fa-solid fa-hashtag search-icon"></i>
                <select className="search-select-clean" value={searchNiche} onChange={(e) => setSearchNiche(e.target.value)}>
                  <option value="">All Niches</option>
                  {COMMON_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {role === 'business' && (
                  <>
                    <div className="search-divider"></div>
                    <div className="search-group">
                        <i className="fa-solid fa-users search-icon"></i>
                        <select className="search-select-clean" value={searchReach} onChange={(e) => setSearchReach(e.target.value)}>
                            <option value="0">Any Reach</option>
                            <option value="1000">1K+ Followers</option>
                            <option value="10000">10K+ Followers</option>
                            <option value="100000">100K+ Followers</option>
                            <option value="1000000">1M+ Followers</option>
                        </select>
                    </div>
                  </>
              )}
              
              <button type="submit" className="search-btn-round">
                Search
              </button>
          </form>

          {loading ?
             <div className="text-white text-center mt-5">Loading Feed...</div> : (
             <div className="masonry-container">
                {posts.map((post) => (
                  <div key={post._id} className="masonry-item post-card glass-card" style={{cursor: 'pointer'}} onClick={() => navigate(`/profile/${post.authorId}`)} data-aos="fade-up">
                    <img src={getImgUrl(post.image)} alt={post.header} className="post-main-img" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PLACEHOLDER; }} />
                    <div className="post-overlay">
                      <div className="d-flex align-items-center gap-2 mb-2">
                         <img src={getAvatarUrl(post.authorImage)} alt="author" style={{width: '30px', height: '30px', borderRadius: '50%', objectFit:'cover', border:'1px solid white'}} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }} />
                         <div>
                            <span style={{color: 'white', fontWeight: 'bold', fontSize: '0.9rem', display:'block', lineHeight:'1'}}>{post.authorName}</span>
                            {post.authorLocation && <span style={{color: '#0dcaf0', fontSize: '0.7rem', display:'block'}}>{post.authorLocation}</span>}
                         </div>
                      </div>
                      <h5 style={{color:'white', margin:0, fontSize: '1rem'}}>{post.header}</h5>
                      
                      {/* FIX: Explicitly setting description color to white/light gray */}
                      <p style={{color: '#e2e8f0', fontSize: '0.85rem', margin: '5px 0 0 0', lineHeight: '1.4'}}>{post.caption}</p>

                      {post.authorNiches && post.authorNiches.length > 0 && (
                          <div style={{display:'flex', gap:'5px', marginTop:'5px', flexWrap:'wrap'}}>
                              {post.authorNiches.slice(0, 2).map((n, i) => (
                                  <span key={i} style={{fontSize:'0.65rem', background:'rgba(99,102,241,0.3)', padding:'2px 6px', borderRadius:'10px', color:'#c7d2fe'}}>{n}</span>
                              ))}
                          </div>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          )}
          {!loading && posts.length === 0 && <div className="text-center text-muted mt-5" style={{padding: "40px"}}><h4>No results found.</h4></div>}
        </div>
      </div>
    </>
  );
}