import React from 'react';

export default function Navbar() {
  return (
    <nav className='navbar custom-navbar'>
      <div className='container'>
        <a className='navbar-brand' href='#'>✦adNova</a>
        <div style={{float:'right'}}>
          <button className='btn btn-outline-light me-2' data-bs-toggle='modal' data-bs-target='#loginModal'>Login</button>
          <button className='btn btn-light text-dark' data-bs-toggle='modal' data-bs-target='#signupModal'>Signup</button>
        </div>
      </div>
    </nav>
  );
}
