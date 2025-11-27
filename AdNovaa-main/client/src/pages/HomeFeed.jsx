import React, { useEffect, useState } from 'react';

export default function HomeFeed() {
  const role = localStorage.getItem('userRole') || 'guest';
  const [items, setItems] = useState([]);
  useEffect(()=>{
    if (role === 'business') {
      setItems([{id:1,title:'Influencer post #1',desc:'Food influencer — Chennai'}]);
    } else if (role === 'influencer') {
      setItems([{id:1,title:'Business post #1',desc:'Looking for fitness influencers — Mumbai'}]);
    } else {
      setItems([{id:1,title:'Please login',desc:'You must login to see your feed.'}]);
    }
  },[role]);
  return (
    <div className='container'>
      <h2>Home Feed ({role})</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        {items.map(it=>(
          <div key={it.id} style={{background:'#08102a',padding:12,borderRadius:8}}>
            <h4>{it.title}</h4>
            <p>{it.desc}</p>
            <button className='btn btn-sm btn-primary'>{role==='business'?'Contact':'Apply'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
