import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/businessDashboard.css";

// API URLs (Ensure these match your backend)
const PROFILE_UPDATE_URL = "http://localhost:5000/api/auth/update-profile";
const PROFILE_FETCH_URL = (userId) => `http://localhost:5000/api/auth/profile/${userId}`;
const UPLOAD_API_URL = "http://localhost:5000/api/auth/upload-image"; 

// Initial State Structure
const initialBusinessState = {
    name: "", tag: "Industry • Location", description: "", email: "", 
    website: "", logo: "", cover: "", owner: "", phone: "",
    // Backend Schema Fields (for saving/updating)
    industry: "", location: "", targetAudience: "", 
    // New fields added to schema:
    ownerName: "", phoneNumber: "", websiteUrl: "",
};

// Helper function to clean the payload by removing empty strings
const cleanPayload = (obj) => {
    const cleaned = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
            if (typeof obj[key] === 'string' && obj[key].trim() === '') {
                continue; 
            }
            if (Array.isArray(obj[key]) || obj[key] !== '') {
                 cleaned[key] = obj[key];
            }
        }
    }
    return cleaned;
};


const BusinessDashboard = () => {
    const { userId, role } = useAuth();
    const [editing, setEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [business, setBusiness] = useState(initialBusinessState);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ img: "", header: "", caption: "", imgFile: null });
    // const [refreshTrigger, setRefreshTrigger] = useState(0); // We will rely on manual update now

    useEffect(() => {
        AOS.init({ duration: 900 });
    }, []);

    // --- 1. FETCH PROFILE DATA ON LOAD ---
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
                    const bizData = userData.businessProfile || {};
                    
                    // MAPPING: Ensure display fields are loaded from fetched data
                    setBusiness({
                        // Core Display Fields
                        name: bizData.brandName || userData.name || 'Business Name',
                        tag: `${bizData.industry || 'Industry'} • ${bizData.location || 'Location'}`,
                        description: bizData.targetAudience || 'Describe your business goals...',
                        email: userData.email, // From main user object
                        
                        // 🚨 FIX MAPPING: Read new schema fields for display
                        owner: bizData.ownerName || userData.name || '',
                        phone: bizData.phoneNumber || '',
                        website: bizData.websiteUrl || '',

                        // Image URLs 
                        logo: bizData.logoUrl || 'https://images.unsplash.com/photo-1602810316594-7b0d4b3f23c1?auto=format&w=400&q=80', 
                        cover: bizData.coverUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=2000&q=80',
                        
                        // Backend Schema Fields (for saving/updating)
                        industry: bizData.industry || '',
                        location: bizData.location || '',
                        targetAudience: bizData.targetAudience || '',
                        ownerName: bizData.ownerName || '', 
                        phoneNumber: bizData.phoneNumber || '',
                        websiteUrl: bizData.websiteUrl || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching business profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    
    // --- 2. API CALL: Save Profile Details (FIXED PERSISTENCE) ---
    const handleSaveProfile = async () => {
        setEditing(false);

        // Prepare raw data payload
        const rawProfileData = {
            brandName: business.name,
            industry: business.industry,
            location: business.location,
            websiteUrl: business.website,
            targetAudience: business.description,
            
            // 🚨 MAPPING FOR DB SAVE (using the schema field names)
            ownerName: business.owner, 
            phoneNumber: business.phone, 
            
            logoUrl: business.logo, 
            coverUrl: business.cover,
        };
        const cleanedProfileData = cleanPayload(rawProfileData);

        const updateData = {
            userId: userId,
            role: role,
            profileData: cleanedProfileData, // Send the cleaned payload
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
                
                // 🚨 CRITICAL PERSISTENCE FIX: Manually update local state instantly
                setBusiness(b => ({
                    ...b,
                    // Update display fields with the data we know was saved
                    owner: cleanedProfileData.ownerName || b.owner,
                    phone: cleanedProfileData.phoneNumber || b.phone,
                    website: cleanedProfileData.websiteUrl || b.website,
                    description: cleanedProfileData.targetAudience || b.description,
                    tag: `${cleanedProfileData.industry || b.industry || 'N/A'} • ${cleanedProfileData.location || b.location || 'N/A'}`,
                }));

            } else {
                alert(`Error saving profile: ${data.message}`);
                setEditing(true); 
            }
        } catch (error) {
            console.error("Network error saving profile:", error);
            alert("Failed to connect to the server to save profile.");
            setEditing(true);
        }
    };
    
    // --- Image Upload Helper Function (Remains the same) ---
    const uploadImage = async (file, fieldName) => {
        if (!file || !userId) return null;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('role', role);
        formData.append('fieldName', fieldName);

        try {
            const response = await fetch(UPLOAD_API_URL, { method: 'POST', body: formData });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(`${fieldName} uploaded successfully!`);
                return data.fileUrl;
            } else {
                alert(`Upload failed for ${fieldName}: ${data.message}`);
                return null;
            }
        } catch (error) {
            console.error(`Upload error for ${fieldName}:`, error);
            alert(`Network error during ${fieldName} upload.`);
            return null;
        }
    }


    // -------------------------
    // HANDLERS (Remain the same)
    // -------------------------
    const handleInputChange = (e, field) => {
        setBusiness({ ...business, [field]: e.target.value });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBusiness(b => ({ ...b, logo: URL.createObjectURL(file) }));
        
        const newUrl = await uploadImage(file, 'logoUrl');
        if (newUrl) {
            setBusiness(b => ({ ...b, logo: newUrl }));
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setBusiness(b => ({ ...b, cover: URL.createObjectURL(file) }));

        const newUrl = await uploadImage(file, 'coverUrl');
        if (newUrl) {
            setBusiness(b => ({ ...b, cover: newUrl }));
        }
    };

    const handleNewPostImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewPost({ ...newPost, imgFile: file, img: URL.createObjectURL(file) });
    };

    const addPost = () => {
        if (!newPost.imgFile) return;
        
        setPosts([...posts, newPost]);
        setNewPost({ img: "", header: "", caption: "", imgFile: null });
        alert("Post added locally. Final API logic needed.");
    };
    
    const handleEditToggle = () => {
        if (editing) {
            handleSaveProfile(); 
        } else {
            setEditing(true); 
        }
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading Profile...</div>;
    }
    return (
        <div className="bizdash-wrapper">
            {/* COVER */}
            <div
                className="bizdash-cover"
                style={{ backgroundImage: `url(${business.cover})` }}
            >
                {editing && (
                    <label className="upload-cover-label">
                        Change Cover
                        <input type="file" onChange={handleCoverUpload} />
                    </label>
                )}

                <div className="bizdash-profile-info">
                    {/* LOGO */}
                    <div className="logo-wrapper">
                        <img src={business.logo} className="bizdash-logo" alt="Business Logo" />
                        {editing && (
                            <label className="upload-logo-label">
                                Change Logo
                                <input type="file" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    {/* NAME & TAG */}
                    <div className="profile-text">
                        {editing ? (
                            <>
                                <input className="edit-input" value={business.name} onChange={(e) => handleInputChange(e, 'name')} />
                                <input className="edit-input" placeholder="Industry • Location" value={business.tag} onChange={(e) => handleInputChange(e, 'tag')} />
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

            {/* BUSINESS DETAILS */}
            <section className="container py-4">
                <div className="bizdash-info-card">
                    <h4>Business Details</h4>
                    {editing ? (
                        <div className="edit-grid">
                            <input className="edit-input" value={business.owner} placeholder="Owner/Contact Name" onChange={(e) => handleInputChange(e, 'owner')} />
                            <input className="edit-input" value={business.email} readOnly disabled /> 
                            <input className="edit-input" value={business.phone} placeholder="Phone Number" onChange={(e) => handleInputChange(e, 'phone')} />
                            <input className="edit-input" value={business.website} placeholder="Website URL" onChange={(e) => handleInputChange(e, 'website')} />
                            <textarea className="edit-textarea" value={business.description} placeholder="Describe your business..." onChange={(e) => handleInputChange(e, 'description')} />
                        </div>
                    ) : (
                        <div className="static-grid">
                            <div><strong>Owner:</strong> {business.owner}</div>
                            <div><strong>Email:</strong> {business.email}</div>
                            <div><strong>Phone:</strong> {business.phone}</div>
                            <div><strong>Website:</strong> {business.website}</div>
                            <p>{business.description}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* POSTS */}
            <section className="container py-4">
                <h4 className="text-white mb-3">Posts</h4>
                {editing && (
                    <div className="new-post-card">
                        <input type="file" onChange={handleNewPostImage} className="file-upload" />
                        <input type="text" placeholder="Header" value={newPost.header} onChange={(e) => setNewPost({ ...newPost, header: e.target.value })} />
                        <input type="text" placeholder="Caption" value={newPost.caption} onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })} />
                        <button onClick={addPost} className="btn btn-primary">
                            Add Post
                        </button>
                    </div>
                )}
                {/* POSTS GRID */}
                <div className="masonry-grid">
                    {posts.map((p, i) => (
                        <div className="masonry-item" key={i}>
                            <img src={p.img} alt={p.header} />
                            <div className="post-hover">
                                <h5>{p.header}</h5>
                                <p>{p.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FLOATING EDIT BUTTON */}
            <button
                className="floating-edit-btn"
                onClick={handleEditToggle}
            >
                {editing ? "Save" : "Edit"}
            </button>
        </div>
    );
};

export default BusinessDashboard;