import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/influencerSignup.css";

const InfluencerSignup = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="signup-container d-flex justify-content-center align-items-center">
      <div className="signup-card shadow-lg p-4 rounded-4">

        {/* Header */}
        <h2 className="text-center fw-bold mb-4">
          Create Influencer Account
        </h2>

        {/* Step Indicator */}
        <div className="step-indicator mb-4">
          <div className={`step-line ${step === 1 ? "active" : ""}`}></div>
          <div className={`step-line ${step === 2 ? "active" : ""}`}></div>
        </div>

        {/* STEP 1: BASIC DETAILS */}
        {step === 1 && (
          <>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="Enter your full name" />
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="example@gmail.com" />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" placeholder="98765XXXXX" />
            </div>

            <button
              className="btn btn-primary w-100 next-btn"
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </>
        )}

        {/* STEP 2: SOCIAL MEDIA VERIFICATION */}
        {step === 2 && (
          <>
            <h5 className="mb-3 mt-2 text-center">Verify Your Social Accounts</h5>

            <div className="social-btn instagram mb-3">
              <i className="bi bi-instagram"></i> Login with Instagram
            </div>

            <div className="social-btn fb mb-3">
              <i className="bi bi-facebook"></i> Login with Facebook
            </div>

            <div className="social-btn yt mb-3">
              <i className="bi bi-youtube"></i> Connect YouTube Channel
            </div>

            <button className="btn btn-success w-100 mt-2">
              Create Account ✔
            </button>

            <button
              className="btn btn-outline-secondary w-100 mt-3"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InfluencerSignup;
