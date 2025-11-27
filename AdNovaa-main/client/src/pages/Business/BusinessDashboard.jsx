import React, { useState } from 'react';
import '../../pages/Business/BusinessDashboard.css';

export default function BusinessDashboard() {
  const [editing, setEditing] = useState(false);
  const [business, setBusiness] = useState({
    name: 'Nova Clothing Co.',
    tag: 'Fashion & Apparel • Mumbai, India',
    description: 'Nova Clothing is a premium streetwear brand delivering trendy and durable outfits.',
    owner: 'John Doe',
    email: 'novaclothing@gmail.com',
    phone: '+91 9876543210',
    website: 'www.novaclothing.com',
    logo: 'https://images.unsplash.com/photo-1602810316594-7b0d4b3f23c1?auto=format&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=2000&q=80',
  });
  const [posts, setPosts] = useState([]);

  return (
    <div className='bizdash-wrapper container'>
      <div className='bizdash-cover' style={{backgroundImage:`url(${business.cover})`}}>
        <div className='bizdash-profile-info'>
          <div className='logo-wrapper'>
            <img src={business.logo} className='bizdash-logo' alt='logo' />
          </div>
          <div className='profile-text'>
            <h2>{business.name}</h2>
            <p>{business.tag}</p>
          </div>
        </div>
      </div>

      <section className='container py-4'>
        <div className='bizdash-info-card'>
          <h4>Business Details</h4>
          <div className='static-grid'>
            <div><strong>Owner:</strong> {business.owner}</div>
            <div><strong>Email:</strong> {business.email}</div>
            <div><strong>Phone:</strong> {business.phone}</div>
            <div><strong>Website:</strong> {business.website}</div>
            <p>{business.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
