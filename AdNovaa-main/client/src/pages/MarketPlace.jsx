import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "../styles/businessDashboard.css"; // Re-using your existing styles for cards

export default function Marketplace() {
  const { role, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Filters
  const [searchLocation, setSearchLocation] = useState("");
  const [searchNiche, setSearchNiche] = useState("");

  useEffect(() => {
    if (isLoggedIn) fetchPartners();
  }, [isLoggedIn, role]); // Fetch initially on load

  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams({
        role: role, // Send MY role, backend will find the opposite
        location: searchLocation,
        niche: searchNiche
      });

      const res = await fetch(`http://localhost:5000/api/auth/partners?${params}`);
      const data = await res.json();

      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPartners();
  };

  const handleConnect = (email) => {
      // Navigate to messages (or you could open a specific chat immediately)
      // For now, let's just go to messages. In the future, pass the email to pre-fill the invite.
      navigate("/messages");
  };

  // Helper to safely extract profile data based on role
  const getProfile = (user) => {
      if (user.role === 'business') return user.businessProfile || {};
      return user.influencerProfile || {};
  };

  if (!isLoggedIn) return <div className="text-center mt-5">Please Login to view the Marketplace.</div>;

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{marginTop: '60px'}}>
        
        {/* HEADER & SEARCH */}
        <div className="text-center mb-5 text-white">
          <h2 className="fw-bold">
            Find {role === 'business' ? 'Influencers' : 'Business Partners'}
          </h2>
          <p className="lead">Connect with the right people for your next campaign.</p>
          
          <form onSubmit={handleSearch} className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
            <input 
              className="form-control" 
              style={{maxWidth: '250px'}}
              placeholder="Location (e.g., Mumbai)"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
            />
            <input 
              className="form-control" 
              style={{maxWidth: '250px'}}
              placeholder={role === 'business' ? "Niche (e.g., Fashion)" : "Industry (e.g., Tech)"}
              value={searchNiche}
              onChange={e => setSearchNiche(e.target.value)}
            />
            <button className="btn btn-primary px-4">Search</button>
          </form>
        </div>

        {/* RESULTS GRID */}
        {loading ? (
            <div className="text-white text-center">Loading...</div>
        ) : (
            <div className="row g-4">
                {partners.length === 0 ? (
                    <div className="text-center text-muted">No partners found. Try different filters.</div>
                ) : (
                    partners.map((p) => {
                        const profile = getProfile(p);
                        const image = profile.pfp || profile.logoUrl || "https://via.placeholder.com/150";
                        const title = profile.brandName || profile.displayName || p.name;
                        const subtitle = profile.industry || profile.niche || "General";
                        const loc = profile.location || "Online";

                        return (
                            <div key={p._id} className="col-md-4 col-lg-3">
                                <div className="card h-100 border-0 shadow-sm" style={{background: '#1e293b', color: 'white'}}>
                                    <div style={{height: '150px', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <img src={image} alt={title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold">{title}</h5>
                                        <p className="card-text text-info small mb-1">{subtitle}</p>
                                        <p className="card-text small mb-3">📍 {loc}</p>
                                        
                                        {/* OPTIONAL: Show Stats */}
                                        {p.role === 'influencer' && (
                                            <div className="d-flex justify-content-between small mb-3 text-muted">
                                                <span>{(profile.followerCount || 0).toLocaleString()} followers</span>
                                            </div>
                                        )}

                                        <button 
                                            className="btn btn-outline-light w-100 btn-sm"
                                            onClick={() => handleConnect(p.email)}
                                        >
                                            Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        )}
      </div>
    </>
  );
}