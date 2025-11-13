import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
const navigate = useNavigate(); // ✅ inside the component!

  const goToSignup = () => {
    navigate("/signup");
  };
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">✦adNova</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Contact</a></li>
            </ul>
          </div>

          <div className="d-flex align-items-center">
            <button className="btn btn-outline-light me-2" onClick={handleShow}>
              <i className="fa-solid fa-right-to-bracket me-1"></i> Login
            </button>
           <button className="btn btn-light text-dark" onClick={goToSignup}>
  <i className="fa-solid fa-user-plus me-1"></i> Signup
</button>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-center text-white d-flex align-items-center justify-content-center">
        <div className="container">
          <h1 className="display-4 fw-bold">
            Connecting Businesses with the Right Influencers
          </h1>
          <p className="lead mt-3 mb-4">
            adNova is a smart platform designed to help brands collaborate with influencers
            who truly match their vision, audience, and goals.
          </p>
          <a href="#" className="btn btn-light btn-lg me-2">Find Influencers</a>
          <a href="#" className="btn btn-outline-light btn-lg">Join as Influencer</a>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-5 text-center text-white">
        <div className="container">
          <h2 className="fw-bold mb-4">About adNova</h2>
          <p className="fs-5 mx-auto" style={{ maxWidth: "800px" }}>
            At <strong>adNova</strong>, we simplify influencer marketing by connecting businesses
            and creators through a single platform.
            Whether you're a small startup looking to grow your reach or an influencer ready to
            collaborate with top brands, adNova provides a seamless experience built on trust,
            transparency, and creativity.
          </p>
        </div>
      </section>

      {/* Signup Modal */}
     
    </>
  );
};

export default Home;
