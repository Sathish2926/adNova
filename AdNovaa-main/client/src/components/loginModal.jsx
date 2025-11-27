import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext"; // 1. Import useAuth

// 🚨 CRITICAL: Assuming your backend is running locally on port 5000 
// and the router is mounted under /api/auth
const LOGIN_API_URL = "http://localhost:5000/api/auth/login"; 

const LoginModal = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 
    const { login } = useAuth(); // 2. Get the login function from context

    // Function to close the Bootstrap modal manually
    const closeBootstrapModal = () => {
        try {
            const modalElement = document.getElementById('loginModal');
            if (modalElement && window.bootstrap && window.bootstrap.Modal) {
                const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
                modal.hide();
            }
        } catch (err) {
            console.error("Error closing modal:", err);
        }
    };

    // The Real API Communication Function
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
            
            // Expected Success Response: { success: true, role: '...', isProfileComplete: true/false }
            // NOTE: You must update your backend to return userId and token!
            return { 
                success: true, 
                role: data.role, 
                isProfileComplete: data.isProfileComplete,
                userId: data.userId || 'mock_user_id' // Ensure your backend returns this!
            }; 

        } catch (error) {
            console.error("API Login Error:", error.message);
            return { success: false, message: error.message };
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
            // 3. Update the global AuthContext state with user details
            login(response);

            // Determine the next destination path
            let dashboardPath = "/"; 
            if (response.isProfileComplete) {
                dashboardPath = response.role === "business" ? "/BusinessDashboard" : "/InfluencerDashboard";
            } else {
                // If profile is NOT complete, always redirect to setup page
                dashboardPath = "/profile-setup"; 
            }
            
            // Close modal before navigation
            closeBootstrapModal(); 

            // Redirect using replace: true
            navigate(dashboardPath, { replace: true });

        } else {
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