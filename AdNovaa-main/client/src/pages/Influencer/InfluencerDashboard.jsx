import React, { useState } from 'react';
import '../../pages/Influencer/InfluencerDashboard.css';
import Navbar from '../../components/Navbar';

export default function InfluencerDashboard() {
  const [editMode, setEditMode] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ img: '', header: '', caption: '' });
  const [profile, setProfile] = useState({
    name: 'Influencer Name',
    categories: 'FASHION • LIFESTYLE',
    location: 'Coimbatore, India',
    bio: 'Authentic stories, creative collaborations.',
    subscribers: '1.2M',
    followers: '350K',
    pfp: 'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg',
  });
  const [posts, setPosts] = useState([]);

  const uploadPfp = (e) => {
    const f = e?.target?.files?.[0];
    if (!f) return;
    setProfile(p => ({...p, pfp: URL.createObjectURL(f)}));
  };
  const uploadPostImage = (e) => {
    const f = e?.target?.files?.[0];
    if (!f) return;
    setNewPost(p=>({...p, img: URL.createObjectURL(f)}));
  };
  const submitPost = () => {
    if (!newPost.img) return;
    setPosts(p => [newPost, ...p]);
    setNewPost({ img:'', header:'', caption:''});
    setShowPostForm(false);
  };

  return (
    <>
      <Navbar />
      <div className='profile-wrapper-react container'>
        <div className='profile-section-react'>
          <aside className='profile-left-react'>
            <div className='pfp-area'>
              <div className='pfp-box' style={{backgroundImage:`url(${profile.pfp})`}} onClick={()=>editMode && document.getElementById('pfpUpload')?.click()} />
              <input id='pfpUpload' type='file' hidden onChange={uploadPfp} />
            </div>
            <h2 className='name-react'>{profile.name}</h2>
            <p className='cat-text-react'>{profile.categories}</p>
            <p className='loc-react'>📍 {profile.location}</p>
            <p className='bio-react'>{profile.bio}</p>
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
                <button className='btn btn-primary me-2' onClick={submitPost}>Save</button>
                <button className='btn btn-secondary' onClick={()=>setShowPostForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <button className='floating-edit-react' onClick={()=>setEditMode(s=>!s)}>{editMode ? 'Save' : 'Edit'}</button>
      </div>
    </>
  );
}
