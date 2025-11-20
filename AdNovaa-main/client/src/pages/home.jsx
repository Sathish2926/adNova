import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const switchTab = (tab) => {
  const infTab = document.getElementById("infTab");
  const bizTab = document.getElementById("bizTab");
  const infForm = document.getElementById("influencerForm");
  const bizForm = document.getElementById("businessForm");

  if (tab === "influencer") {
    infTab.classList.add("active");
    bizTab.classList.remove("active");
    infForm.classList.remove("d-none");
    bizForm.classList.add("d-none");
  } else {
    bizTab.classList.add("active");
    infTab.classList.remove("active");
    bizForm.classList.remove("d-none");
    infForm.classList.add("d-none");
  }
};

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // IntersectionObserver for service animation
  useEffect(() => {
    const target = document.querySelector(".service-loop");
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          target.classList.add("show");
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(target);
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // LOGIN FUNCTION WITH VALIDATION
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const email = document.querySelector("#login_email").value;
    const password = document.querySelector("#login_pass").value;

    // Dummy fetch example (replace with your API)
    // const res = await fetch("http://localhost:5000/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await res.json();

    // Navigate based on role
    // if (data.role === "influencer") navigate("/influencer-dashboard");
    // else if (data.role === "business") navigate("/business-dashboard");

    alert("Login validated successfully!");
  };

  // INFLUENCER SIGNUP
  const handleInfluencerSignup = (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    alert("Influencer signup validated!");
  };

  // BUSINESS SIGNUP
  const handleBusinessSignup = (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    alert("Business signup validated!");
  };

  return (
    <>
      {/* Navbar */}
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

      {/* Hero Section */}
      <div className="full-bg">
        <section
          className="hero-section text-center text-white d-flex align-items-center justify-content-center"
          data-aos="fade-up"
        >
          <div className="container" data-aos="fade-up">
            <h1 className="display-4 fw-bold">
              Connecting Businesses with the Right Influencers
            </h1>
            <p className="lead mt-3 mb-4">
              adNova helps brands find influencers who match their audience, vision & goals.
            </p>
            <a href="#" className="btn btn-light btn-lg me-2">
              Find Influencers
            </a>
            <a href="#" className="btn btn-outline-light btn-lg">
              Join as Influencer
            </a>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="container text-center">
            <h2 className="mb-5">Our Services</h2>
            <div className="row g-5">
              <div className="col-md-4" data-aos="fade-up">
                <div className="service-box">
                  <h4>Business Promotion</h4>
                  <p>Promote your business through verified influencers and gain authentic visibility.</p>
                </div>
              </div>
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                <div className="service-box">
                  <h4>Secure Collabs</h4>
                  <p>Safe, transparent collaboration with influencers for honest results.</p>
                </div>
              </div>
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                <div className="service-box">
                  <h4>Brand Growth</h4>
                  <p>Grow your brand with analytics, reporting and influencer tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
 <section className="container py-5">
        <div className="row align-items-center">

          <div className="col-md-6" data-aos="fade-left">
            <h3 className="text-white fw-bold">About the Influencers</h3>
            <p className="text-light">
              Smart, creative individuals ready to boost your brand with high-engagement content.
            </p>
          </div>

          <div className="col-md-6 d-flex gap-3 flex-wrap justify-content-center" data-aos="fade-right">
            <img src="assets\images\Animation professionnelle de vos comptes….jpeg" className="info-img" />
            <img src="assets\images\Free photo influencer marketing collage _ Free….jpeg" className="info-img" />
            <img src="assets\images\A group of people in front of them is a list of….jpeg" className="info-img" />
          </div>

        </div>
      </section>
       {/* ABOUT BUSINESSES */}
      <section className="container py-5">
   <div className="col-md-6" data-aos="fade-left">
            <h3 className="text-white fw-bold">About the Business</h3>
          </div>
        <div className="row g-4">
  <div className="col-md-4" data-aos="fade-up" data-aos-delay="0">
    <div className="biz-card">
      <img src="/assets/images/undefined (1).jpeg" alt="business" />
    </div>
  </div>

  <div className="col-md-4" data-aos="fade-up" data-aos-delay="150">
    <div className="biz-card"><img src="assets\images\undefined (3).jpeg" alt="" srcset="" /></div>
  </div>

  <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
    <div className="biz-card"><img src="assets\images\Photo colorful assortment of gents tshir….jpeg" alt="" srcset="" /></div>
  </div>
</div>

      </section>
       {/* USER REVIEWS */}
      <section className="container py-5">
        <h3 className="text-white fw-bold mb-4" data-aos="fade-up">User Reviews</h3>

        <div className="row g-4">
          <div className="col-md-6" data-aos="zoom-in">
            <div className="review-card p-4">"A perfect piece of design!"</div>
          </div>

          <div className="col-md-6" data-aos="zoom-in">
            <div className="review-card p-4">"The smartest tool out there!"</div>
          </div>
        </div>
      </section>
      {/* About */}
     <section id="about" className="about-section py-5 text-center text-white" data-aos="fade-up">

        <div className="container" data-aos="fade-up">
          <h2 className="fw-bold mb-4">About adNova</h2>
          <p className="fs-5 mx-auto" style={{ maxWidth: "800px" }}>
            adNova bridges the gap between brands and influencers, providing a
            transparent, secure, and creative platform for smooth collaborations.
          </p>
        </div>
      </section>

      {/* Contact */}
    <section id="contact" className="py-5 text-white text-center contact-section">
        <div className="container" data-aos="fade-up">
          <h2 className="fw-bold mb-4">Contact Us</h2>
          <p className="fs-5 mb-3">We’re always here to help.</p>
          <p>Email: <strong>support@adnova.com</strong></p>
          <p>Instagram: <strong>@adnova_official</strong></p>
        </div>
      </section>
      </div>
        {/* Signup Modal */}
        <div className="modal fade" id="signupModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content signup-popup">
              <div className="modal-header border-0">
                <h4 className="fw-bold text-white">Create Your Account</h4>
                <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                {/* Tabs */}
                <div className="d-flex gap-2 mb-4">
                  <button className="signup-tab active" id="infTab" onClick={() => switchTab("influencer")}>
                    Influencer
                  </button>
                  <button className="signup-tab" id="bizTab" onClick={() => switchTab("business")}>
                    Business
                  </button>
                </div>

                {/* Influencer Form */}
                <form id="influencerForm" className="signup-form needs-validation" noValidate>
                  <input className="form-control mb-3" placeholder="Full Name" pattern="^[a-zA-Z\s]{3,}$" required />
                  <div className="invalid-feedback">Enter a valid name (min 3 letters).</div>

                  <input className="form-control mb-3" placeholder="Email Address" type="email" required />
                  <div className="invalid-feedback">Enter a valid email.</div>

                  <input className="form-control mb-3" placeholder="Phone Number" type="tel" pattern="^\d{10}$" required />
                  <div className="invalid-feedback">Enter a 10-digit phone number.</div>

                  <button type="button" className="instagram-btn mb-3">
                    <i className="fa-brands fa-instagram me-2"></i>Sign up with Instagram
                  </button>

                  <button className="btn btn-success w-100" type="submit" onClick={handleInfluencerSignup}>
                    Create Influencer Account
                  </button>
                </form>

                {/* Business Form */}
                <form id="businessForm" className="signup-form d-none needs-validation" noValidate>
                  <input className="form-control mb-3" placeholder="Business Name" pattern=".{3,}" required />
                  <div className="invalid-feedback">Business name must be at least 3 characters.</div>

                  <input className="form-control mb-3" placeholder="Owner Name" pattern="^[a-zA-Z\s]{3,}$" required />
                  <div className="invalid-feedback">Owner name must be at least 3 letters.</div>

                  <input className="form-control mb-3" placeholder="Business Email" type="email" required />
                  <div className="invalid-feedback">Enter a valid email.</div>

                  <input className="form-control mb-3" placeholder="Contact Number" type="tel" pattern="^\d{10}$" required />
                  <div className="invalid-feedback">Enter a 10-digit phone number.</div>

                  <button className="btn btn-success w-100" type="submit" onClick={handleBusinessSignup}>
                    Create Business Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
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
                <h4 className="modal-title fw-bold" id="loginModalLabel" style={{ fontSize: "1.6rem" }}>
                  Welcome Back
                </h4>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
                    background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
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
    
    </>
  );
};

export default Home;
