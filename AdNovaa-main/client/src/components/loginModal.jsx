import React from "react";

const LoginModal = ({ handleLogin }) => {
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
          <div className="modal-header border-0">
            <h4
              className="modal-title fw-bold"
              id="loginModalLabel"
              style={{ fontSize: "1.6rem" }}
            >
              Welcome Back
            </h4>
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
