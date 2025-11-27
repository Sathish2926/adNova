import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext"; 

const Navbar = () => {
  const { isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine dashboard link based on role
  const dashboardLink = role === "business" ? "/BusinessDashboard" : "/InfluencerDashboard";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">✦adNova</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              
              {/* CONDITIONAL LINKS */}
              {isLoggedIn ? (
                <>
                    {/* NEW LINK HERE */}
                    <li className="nav-item">
                        <Link className="nav-link" to="/marketplace">Find Partners</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" to={dashboardLink}>My Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/messages">Messages</Link>
                    </li>
                </>
              ) : (
                <>
                    <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
                    <li className="nav-item"><a className="nav-link" href="#about">About Us</a></li>
                </>
              )}
            </ul>
          </div>

          <div className="d-flex align-items-center">
            {isLoggedIn ? (
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    Logout
                </button>
            ) : (
                <>
                    <button className="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i className="fa-solid fa-right-to-bracket me-1"></i> Login
                    </button>
                    <button className="btn btn-light text-dark" data-bs-toggle="modal" data-bs-target="#signupModal">
                    <i className="fa-solid fa-user-plus me-1"></i> Signup
                    </button>
                </>
            )}
          </div>
        </div>
      </nav>
  );
};
export default Navbar;