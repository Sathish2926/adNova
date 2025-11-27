import React, { useState } from 'react';

export default function SignupModal() {
  const [role, setRole] = useState('influencer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) return alert(data.message || 'Signup failed');
      alert('Signup successful. Please login.');
      const modal = document.getElementById('signupModal');
      if (modal) window.bootstrap?.Modal.getInstance(modal)?.hide();
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  }

  return (
    <div className='modal fade' id='signupModal' tabIndex='-1' aria-hidden='true'>
      <div className='modal-dialog modal-dialog-centered modal-lg'>
        <form className='modal-content p-3' onSubmit={submit}>
          <div className='modal-header border-0'>
            <h5 className='modal-title'>Signup</h5>
            <button type='button' className='btn-close' data-bs-dismiss='modal' />
          </div>
          <div className='modal-body'>
            <div className='d-flex gap-2 mb-3'>
              <button type='button' onClick={()=>setRole('influencer')} className={role==='influencer'?'btn btn-info':'btn btn-outline-light'}>Influencer</button>
              <button type='button' onClick={()=>setRole('business')} className={role==='business'?'btn btn-info':'btn btn-outline-light'}>Business</button>
            </div>
            <input className='form-control mb-2' placeholder='Full name' value={name} onChange={(e)=>setName(e.target.value)} required />
            <input className='form-control mb-2' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className='form-control mb-2' placeholder='Password' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button className='btn btn-success w-100 mt-2' type='submit'>Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
