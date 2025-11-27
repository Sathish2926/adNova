import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

// 🚨 CRITICAL: Assuming your backend is running locally on port 5000 
// and the router is mounted under /api/auth
const LOGIN_API_URL = "http://localhost:5000/api/auth/login"; 

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 
  
  // 1. The Real API Communication Function
  const loginUser = async (credentials) => {
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Attempt to parse the response data regardless of status
      const data = await response.json(); 

      if (!response.ok) {
        const errorMessage = data.message || `Login failed. Status: ${response.status}.`;
        throw new Error(errorMessage);
      }
      
      // SUCCESS PATH: Return the success state and the role
      return { success: true, role: data.role }; 

    } catch (error) {
      console.error("API Login Error:", error.message);
      return { success: false, message: error.message };
    }
  };

  const closeBootstrapModal = () => {
    try {
        const modalElement = document.getElementById('loginModal');
        // Check if Bootstrap's JS Modal class is available globally (window.bootstrap)
        if (modalElement && window.bootstrap && window.bootstrap.Modal) {
            // Get the existing modal instance or create a new one
            const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
            modal.hide();
        } else {
            console.warn("Bootstrap Modal JS not available. Cannot manually close modal.");
        }
    } catch (err) {
        console.error("Error closing modal:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simple front-end validation
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const response = await loginUser({ email, password }); 
    
    // 🚨 FIX 1: Removed redundant/incorrect role declaration outside of the if block.
    
    if (response.success) {
      const role = response.role; // Read role ONLY on success

      let dashboardPath = "/"; // Default fallback

      if (role === "business") {
          // Use lowercase path for consistency, unless 'BusinessDashboard' is required by React Router
          dashboardPath = "/BusinessDashboard"; 
      } else if (role === "influencer") {
          dashboardPath = "/influencer-dashboard";
      }
      
      // 🚨 FIX 2: Manually close the modal before redirection.
      // This is often required when using modals in React to prevent conflicts.
      closeBootstrapModal(); 

      // 🚨 FIX 3: Redirect with replace: true to prevent back navigation.
      navigate(dashboardPath, { replace: true });

    } else {
      // Show the specific error message returned from the API/try-catch
      alert("Login failed: " + response.message);
    }
  };

  return (
    <div
      className="modal fade"
      id="loginModal"
      tabIndex="-1"
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <form
          className="modal-content border-0 shadow-lg needs-validation"
          style={{
            borderRadius: "18px",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            padding: "25px",
            color: "white",
          }}
          noValidate
          onSubmit={handleLogin} 
        >
          {/* ... (Modal Header remains the same) ... */}
          <div className="modal-header border-0">
            <h4
              className="modal-title fw-bold"
              id="loginModalLabel"
              style={{ fontSize: "1.6rem" }}
            >
              Welcome Back
            </h4>
            {/* This button will trigger the close animation */}
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                id="login_email"
                type="email"
                className="form-control p-3"
                placeholder="Enter your email"
                required
                style={{
                  background: "#1b072aff",
                  border: "1px solid #0f0a27cc",
                  borderRadius: "12px",
                  color: "white",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="invalid-feedback">Enter a valid email.</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                id="login_pass"
                type="password"
                className="form-control p-3"
                placeholder="Enter your password"
                pattern="^(?=.*[A-Za-z])(?=.*\d).{6,}$"
                required
                style={{
                  background: "#1b072aff",
                  border: "1px solid #ffffff20",
                  borderRadius: "12px",
                  color: "white",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="invalid-feedback">
                Password must be at least 6 characters, including letters & numbers.
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <small className="text-info">Forgot Password?</small>
            </div>

            <button
              className="btn w-100 py-3 mt-3"
              style={{
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                borderRadius: "12px",
                border: "none",
                fontWeight: "600",
                fontSize: "1rem",
                color: "white",
              }}
              type="submit"
            >
              Login
            </button>
 <div className="text-center mt-4 mb-2">

              <small className="text-light">Or login using</small>

            </div>



            <button

              className="btn w-100 py-3"

              style={{

                background:

                  "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",

                border: "none",

                color: "white",

                fontWeight: "600",

                borderRadius: "10px",

              }}

              type="button"

            >

              Login with Instagram

            </button>

          
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;