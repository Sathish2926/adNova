import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link } from "react-router-dom";
// optional if you add external css

const Signup = () => {
  const [activeTab, setActiveTab] = useState("influencer");

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #080822, #040436)",
        color: "white",
        minHeight: "100vh",
        paddingTop: "60px",
      }}
    >
      <div className="signup-container mx-auto p-4" style={{ maxWidth: "500px", background: "rgba(0,0,0,0.7)", borderRadius: "10px" }}>
        <h3 className="text-center mb-4">Join adNova</h3>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3 justify-content-center" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "influencer" ? "active" : ""}`}
              onClick={() => setActiveTab("influencer")}
            >
              Influencer
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "business" ? "active" : ""}`}
              onClick={() => setActiveTab("business")}
            >
              Business
            </button>
          </li>
        </ul>

        {/* Influencer Form */}
        {activeTab === "influencer" && (
          <form>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="Enter your name" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Enter your email" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Social Media Handle</label>
              <input type="text" className="form-control" placeholder="@yourhandle" />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Create a password" required />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Register as Influencer
            </button>
          </form>
        )}

        {/* Business Form */}
        {activeTab === "business" && (
          <form>
            <div className="mb-3">
              <label className="form-label">Business Name</label>
              <input type="text" className="form-control" placeholder="Enter business name" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Enter company email" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Website / Social Page</label>
              <input type="text" className="form-control" placeholder="https://yourbusiness.com" />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Create a password" required />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Register as Business
            </button>
          </form>
        )}

        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none text-info">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
