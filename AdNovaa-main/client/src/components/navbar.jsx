 import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            ✦adNova
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse justify-content-center"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services">
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-light me-2"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
            >
              <i className="fa-solid fa-right-to-bracket me-1"></i> Login
            </button>

            <button
              className="btn btn-light text-dark"
              data-bs-toggle="modal"
              data-bs-target="#signupModal"
            >
              <i className="fa-solid fa-user-plus me-1"></i> Signup
            </button>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;

 