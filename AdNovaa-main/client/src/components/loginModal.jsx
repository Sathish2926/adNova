import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext"; 

const LOGIN_API_URL = "http://localhost:5000/api/auth/login"; 
const FORGOT_PASSWORD_API_URL = "http://localhost:5000/api/auth/forgot-password";

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetMessageType, setResetMessageType] = useState(""); // 'success' or 'error'
  const [isResettingPassword, setIsResettingPassword] = useState(false);
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
    } catch (error) {
        console.error("Error closing modal:", error);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setResetMessage("Please enter your email address.");
      setResetMessageType("error");
      return;
    }

    setIsResettingPassword(true);
    setResetMessage("");
    
    try {
      const response = await fetch(FORGOT_PASSWORD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage("Password reset link sent to your email. Please check your inbox.");
        setResetMessageType("success");
        setForgotPasswordEmail("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage("");
        }, 3000);
      } else {
        setResetMessage(data.message || "Failed to send reset link.");
        setResetMessageType("error");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setResetMessage("An error occurred. Please try again.");
      setResetMessageType("error");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content border-0 shadow-lg needs-validation" style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "25px", color: "white" }} noValidate onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} >
          <div className="modal-header border-0">
            <h4 className="modal-title fw-bold" id="loginModalLabel" style={{ fontSize: "1.6rem" }}>
              {showForgotPassword ? "Reset Password" : "Welcome Back"}
            </h4>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body">
            {!showForgotPassword ? (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control p-3" placeholder="Enter your email" required style={{ background: "#1b072aff", border: "1px solid #0f0a27cc", borderRadius: "12px", color: "white" }} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input type="password" className="form-control p-3" placeholder="Enter your password" required style={{ background: "#1b072aff", border: "1px solid #ffffff20", borderRadius: "12px", color: "white" }} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="btn w-100 py-3 mt-3" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "1rem", color: "white" }} type="submit">Login</button>
                
                <div className="text-center mt-3">
                  <button type="button" className="btn btn-link text-decoration-none" style={{ color: "#6366F1", fontSize: "0.9rem" }} onClick={() => setShowForgotPassword(true)}>
                    Forgot your password?
                  </button>
                </div>
                
                <div className="text-center mt-4 mb-2"><small className="text-light">Or login using</small></div>
                <button className="btn w-100 py-3" style={{ background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)", border: "none", color: "white", fontWeight: "600", borderRadius: "10px" }} type="button">Login with Instagram</button>
              </>
            ) : (
              <>
                <p className="text-light mb-3">Enter your email address to receive a password reset link.</p>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input 
                    type="email" 
                    className="form-control p-3" 
                    placeholder="Enter your registered email" 
                    required 
                    style={{ background: "#1b072aff", border: "1px solid #0f0a27cc", borderRadius: "12px", color: "white" }} 
                    value={forgotPasswordEmail} 
                    onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                  />
                </div>

                {resetMessage && (
                  <div className={`alert ${resetMessageType === 'success' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`} role="alert">
                    <small>{resetMessage}</small>
                  </div>
                )}

                <button 
                  className="btn w-100 py-3 mt-3" 
                  style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "1rem", color: "white" }} 
                  type="submit"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none" 
                    style={{ color: "#6366F1", fontSize: "0.9rem" }} 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetMessage("");
                      setForgotPasswordEmail("");
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;