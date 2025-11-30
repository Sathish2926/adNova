import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; 

export default function Marketplace() {
  const { userId, role } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("");

  // Helper to fix image URLs
  const getImgUrl = (path) => {
      if (!path) return "https://via.placeholder.com/400x300";
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
        let loc = "";
        
        // 1. Get User Location
        if(userId) {
            try {
                const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
                const data = await res.json();
                if(data.success) {
                    if(role === 'business') loc = data.user.businessProfile?.location || "";
                    else loc = data.user.influencerProfile?.location || "";
                    setUserLocation(loc);
                }
            } catch(e) { console.error(e); }
        }

        // 2. Fetch Feed (Sending userId to exclude own posts)
        try {
            const params = new URLSearchParams({ userLocation: loc, userId: userId || "" });
            const res = await fetch(`http://localhost:5000/api/posts/feed?${params}`);
            const data = await res.json();
            if (data.success) setPosts(data.posts);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    fetchData();
  }, [userId, role]);

  return (
    <>
      <Navbar />
      <div className="bizdash-wrapper">
        <div className="container" style={{maxWidth: '1200px', marginTop: '40px'}}>
          <div className="text-center mb-5 text-white" data-aos="fade-up">
            <h2 className="fw-bold display-5">Explore Campaigns</h2>
            <p className="lead" style={{color:'#cbd5e1'}}>
                {userLocation ? `Showing top results near ${userLocation}` : "Discover content from top Businesses and Influencers"}
            </p>
          </div>

          {loading ? <div className="text-white text-center">Loading Feed...</div> : (
             <div className="masonry-container">
                {posts.map((post) => (
                  <div 
                    key={post._id} 
                    className="masonry-item post-card glass-card"
                    style={{cursor: 'pointer'}}
                    onClick={() => navigate(`/profile/${post.authorId}`)}
                  >
                    {/* USE HELPER FUNCTION HERE */}
                    <img src={getImgUrl(post.image)} alt="post" />
                    
                    <div className="post-overlay">
                      <div className="d-flex align-items-center gap-2 mb-2">
                         <img 
                           src={getImgUrl(post.authorImage)} 
                           alt="author" 
                           style={{width: '30px', height: '30px', borderRadius: '50%', objectFit:'cover', border:'1px solid white'}}
                         />
                         <div>
                            <span style={{color: 'white', fontWeight: 'bold', fontSize: '0.9rem', display:'block', lineHeight:'1'}}>
                              {post.authorName}
                            </span>
                         </div>
                      </div>
                      <h5 style={{color:'white', margin:0, fontSize: '1rem'}}>{post.header}</h5>
                      <p style={{color:'#e2e8f0', fontSize: '0.8rem', margin:0, opacity:0.8}}>
                        {post.caption?.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center text-muted mt-5"><h4>No posts found.</h4></div>
          )}
        </div>
      </div>
    </>
  );
}