import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext"; 

const LOGIN_API_URL = "http://localhost:5000/api/auth/login"; 

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 
  const { login } = useAuth(); 
  
  const loginUser = async (credentials) => {
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json(); 

      if (!response.ok) {
        const errorMessage = data.message || `Login failed. Status: ${response.status}.`;
        throw new Error(errorMessage);
      }
      return { success: true, ...data }; 
    } catch (error) {
      console.error("API Login Error:", error.message);
      return { success: false, message: error.message };
    }
  };

  const closeBootstrapModal = () => {
    try {
        const modalElement = document.getElementById('loginModal');
        if (modalElement && window.bootstrap && window.bootstrap.Modal) {
            const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
            modal.hide();
        } else {
            // Fallback DOM removal if instance not found
            if(modalElement) {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if(backdrop) backdrop.remove();
            }
        }
    } catch (err) {
        console.error("Error closing modal:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const response = await loginUser({ email, password }); 
    
    if (response.success) {
      login(response);

      const role = response.role; 
      let dashboardPath = "/"; 

      // FIXED ROUTE CASING HERE
      if (role === "business") {
          dashboardPath = "/BusinessDashboard"; 
      } else if (role === "influencer") {
          dashboardPath = "/InfluencerDashboard"; 
      }
      
      closeBootstrapModal(); 
      navigate(dashboardPath, { replace: true });

    } else {
      alert("Login failed: " + response.message);
    }
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content border-0 shadow-lg needs-validation" style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "25px", color: "white" }} noValidate onSubmit={handleLogin} >
          <div className="modal-header border-0">
            <h4 className="modal-title fw-bold" id="loginModalLabel" style={{ fontSize: "1.6rem" }}>Welcome Back</h4>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control p-3" placeholder="Enter your email" required style={{ background: "#1b072aff", border: "1px solid #0f0a27cc", borderRadius: "12px", color: "white" }} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input type="password" className="form-control p-3" placeholder="Enter your password" required style={{ background: "#1b072aff", border: "1px solid #ffffff20", borderRadius: "12px", color: "white" }} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="btn w-100 py-3 mt-3" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "1rem", color: "white" }} type="submit">Login</button>
            
            <div className="text-center mt-4 mb-2"><small className="text-light">Or login using</small></div>
            <button className="btn w-100 py-3" style={{ background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)", border: "none", color: "white", fontWeight: "600", borderRadius: "10px" }} type="button">Login with Instagram</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;