import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErr(data.message || 'Login failed');
        return;
      }
      localStorage.setItem('userRole', data.role || 'unknown');
      localStorage.setItem('userEmail', email);
      if (data.role === 'business') navigate('/business-dashboard');
      else if (data.role === 'influencer') navigate('/influencer-dashboard');
      else navigate('/home');
      // close modal (Bootstrap)
      const modal = document.getElementById('loginModal');
      if (modal) window.bootstrap?.Modal.getInstance(modal)?.hide();
    } catch (err) {
      console.error(err);
      setErr('Server error');
    }
  }

  return (
    <div className='modal fade' id='loginModal' tabIndex='-1' aria-hidden='true'>
      <div className='modal-dialog modal-dialog-centered'>
        <form className='modal-content p-3' onSubmit={submit}>
          <div className='modal-header border-0'>
            <h5 className='modal-title'>Login</h5>
            <button type='button' className='btn-close' data-bs-dismiss='modal' />
          </div>
          <div className='modal-body'>
            <input className='form-control mb-3' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className='form-control mb-3' placeholder='Password' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} required />
            {err && <div style={{color:'salmon'}}>{err}</div>}
            <button className='btn btn-primary w-100 mt-2' type='submit'>Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
