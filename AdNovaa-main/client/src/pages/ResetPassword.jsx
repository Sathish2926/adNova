import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RESET_PASSWORD_API_URL = "http://localhost:5000/api/auth/reset-password";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link.");
      setMessageType("error");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(RESET_PASSWORD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to reset password.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
      <div className="card border-0 shadow-lg p-5" style={{ maxWidth: "400px", borderRadius: "18px", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
        <h3 className="text-white text-center mb-4 fw-bold">Reset Your Password</h3>

        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-white">New Password</label>
            <input
              type="password"
              className="form-control p-3"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ background: "#1b072aff", border: "1px solid #0f0a27cc", borderRadius: "12px", color: "white" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-white">Confirm Password</label>
            <input
              type="password"
              className="form-control p-3"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ background: "#1b072aff", border: "1px solid #0f0a27cc", borderRadius: "12px", color: "white" }}
            />
          </div>

          {message && (
            <div className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"} py-2 px-3 mb-3`} role="alert">
              <small>{message}</small>
            </div>
          )}

          <button
            className="btn w-100 py-3 mt-3"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "1rem", color: "white" }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" style={{ color: "#6366F1", textDecoration: "none", fontSize: "0.9rem" }}>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
