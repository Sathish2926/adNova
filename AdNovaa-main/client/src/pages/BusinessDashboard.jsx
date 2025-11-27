import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/businessDashboard.css";

const BusinessDashboard = () => {
  useEffect(() => {
    AOS.init({ duration: 900 });
  }, []);

  // -------------------------
  // MAIN BUSINESS PROFILE STATE
  // -------------------------
  const [editing, setEditing] = useState(false);

  const [business, setBusiness] = useState({
    name: "Nova Clothing Co.",
    tag: "Fashion & Apparel • Mumbai, India",
    description:
      "Nova Clothing is a premium streetwear brand delivering trendy and durable outfits.",
    owner: "John Doe",
    email: "novaclothing@gmail.com",
    phone: "+91 9876543210",
    website: "www.novaclothing.com",
    logo:
      "https://images.unsplash.com/photo-1602810316594-7b0d4b3f23c1?auto=format&w=400&q=80",
    cover:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=2000&q=80",
  });

  // -------------------------
  // POSTS STATE
  // -------------------------
  const [posts, setPosts] = useState([
    {
      img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=600&q=70",
      header: "Streetwear Drop",
      caption: "Bold. Modern. Fresh.",
    },
    {
      img: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&w=600&q=70",
      header: "Premium Hoodies",
      caption: "Soft-touch fleece material",
    },
  ]);

  const [newPost, setNewPost] = useState({
    img: "",
    header: "",
    caption: "",
  });

  // -------------------------
  // IMAGE UPLOAD HANDLERS
  // -------------------------
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setBusiness({ ...business, logo: URL.createObjectURL(file) });
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    setBusiness({ ...business, cover: URL.createObjectURL(file) });
  };

  // -------------------------
  // NEW POST HANDLER
  // -------------------------
  const handleNewPostImage = (e) => {
    const file = e.target.files[0];
    setNewPost({ ...newPost, img: URL.createObjectURL(file) });
  };

  const addPost = () => {
    if (!newPost.img) return;
    setPosts([...posts, newPost]);
    setNewPost({ img: "", header: "", caption: "" });
  };

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
            <img src={business.logo} className="bizdash-logo" />
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
                <input
                  className="edit-input"
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({ ...business, name: e.target.value })
                  }
                />
                <input
                  className="edit-input"
                  value={business.tag}
                  onChange={(e) =>
                    setBusiness({ ...business, tag: e.target.value })
                  }
                />
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
              <input
                className="edit-input"
                value={business.owner}
                onChange={(e) =>
                  setBusiness({ ...business, owner: e.target.value })
                }
              />
              <input
                className="edit-input"
                value={business.email}
                onChange={(e) =>
                  setBusiness({ ...business, email: e.target.value })
                }
              />
              <input
                className="edit-input"
                value={business.phone}
                onChange={(e) =>
                  setBusiness({ ...business, phone: e.target.value })
                }
              />
              <input
                className="edit-input"
                value={business.website}
                onChange={(e) =>
                  setBusiness({ ...business, website: e.target.value })
                }
              />
              <textarea
                className="edit-textarea"
                value={business.description}
                onChange={(e) =>
                  setBusiness({ ...business, description: e.target.value })
                }
              />
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

        {/* ADD NEW POST */}
        {editing && (
          <div className="new-post-card">
            <input
              type="file"
              onChange={handleNewPostImage}
              className="file-upload"
            />

            <input
              type="text"
              placeholder="Header"
              value={newPost.header}
              onChange={(e) =>
                setNewPost({ ...newPost, header: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Caption"
              value={newPost.caption}
              onChange={(e) =>
                setNewPost({ ...newPost, caption: e.target.value })
              }
            />

            <button onClick={addPost} className="btn btn-primary">
              Add Post
            </button>
          </div>
        )}

        {/* POSTS GRID */}
        <div className="masonry-grid">
          {posts.map((p, i) => (
            <div className="masonry-item" key={i}>
              <img src={p.img} />

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
        onClick={() => setEditing(!editing)}
      >
        {editing ? "Save" : "Edit"}
      </button>

    </div>
  );
};

export default BusinessDashboard;
