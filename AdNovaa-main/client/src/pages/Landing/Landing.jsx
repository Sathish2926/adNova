import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./landing.css";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// TAB SWITCHING FOR SIGNUP
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

const Landing = () => {
  const navigate = useNavigate();

  // AOS Init
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Intersection Observer (your original animation logic)
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

  // LOGIN FUNCTION (✔ FIXED)
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const email = document.querySelector("#login_email").value;
    const password = document.querySelector("#login_pass").value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success)
        return alert(data.message || "Invalid email or password");

      // store role for protected routing
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("email", email);

      // redirect based on role
      if (data.role === "influencer") navigate("/influencer-dashboard");
      else if (data.role === "business") navigate("/business-dashboard");
      else navigate("/home"); // fallback

      // close login modal
      const modal = document.getElementById("loginModal");
      if (modal) window.bootstrap.Modal.getInstance(modal)?.hide();
    } catch (err) {
      console.error(err);
      alert("Login failed! Check server.");
    }
  };

  // INFLUENCER SIGNUP (✔ FIXED)
  const handleInfluencerSignup = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[placeholder="Email Address"]').value;
    const phone = form.querySelector('input[placeholder="Phone Number"]').value;
    const password = form.querySelector('input[placeholder="Password"]').value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: "influencer" }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("Influencer account created! Please login.");
      form.reset();
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  // BUSINESS SIGNUP (✔ FIXED)
  const handleBusinessSignup = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const name = form.querySelector('input[placeholder="Business Name"]').value;
    const owner = form.querySelector('input[placeholder="Owner Name"]').value;
    const email = form.querySelector('input[placeholder="Business Email"]').value;
    const phone = form.querySelector('input[placeholder="Contact Number"]').value;
    const password = form.querySelector('input[placeholder="Password"]').value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          owner,
          email,
          phone,
          password,
          role: "business",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("Business account created! Please login.");
      form.reset();
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">✦adNova</a>

          <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-center" id="navbarContent">
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link active">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="d-flex align-items-center">
            <button className="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
              Login
            </button>
            <button className="btn btn-light text-dark" data-bs-toggle="modal" data-bs-target="#signupModal">
              Signup
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="full-bg">
        <section className="hero-section text-center text-white d-flex align-items-center justify-content-center" data-aos="fade-up">
          <div className="container" data-aos="fade-up">
            <h1 className="display-4 fw-bold">Connecting Businesses with the Right Influencers</h1>
            <p className="lead mt-3 mb-4">
              adNova helps brands find influencers who match their audience, vision & goals.
            </p>
            <button className="btn btn-light btn-lg me-2" data-bs-toggle="modal" data-bs-target="#signupModal">
              Join as Influencer
            </button>
            <button className="btn btn-outline-light btn-lg" data-bs-toggle="modal" data-bs-target="#loginModal">
              Login
            </button>
          </div>
        </section>

        {/* ----------------------- SERVICES ------------------------ */}
        <section id="services" className="services-section">
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
                  <p>Grow your brand with analytics and influencer performance insights.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------- ABOUT INFLUENCERS ------------------------ */}
        <section className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-6" data-aos="fade-left">
              <h3 className="text-white fw-bold">About the Influencers</h3>
              <p className="text-light">
                Smart, creative individuals ready to boost your brand with high-engagement content.
              </p>
            </div>

            <div className="col-md-6 d-flex gap-3 flex-wrap justify-content-center" data-aos="fade-right">
              <img src="/assets/images/inf1.jpeg" className="info-img" />
              <img src="/assets/images/inf2.jpeg" className="info-img" />
              <img src="/assets/images/inf3.jpeg" className="info-img" />
            </div>
          </div>
        </section>

        {/* ----------------------- ABOUT BUSINESS ------------------------ */}
        <section className="container py-5">
          <h3 className="text-white fw-bold mb-4" data-aos="fade-up">About the Business</h3>

          <div className="row g-4">
            <div className="col-md-4" data-aos="fade-up">
              <div className="biz-card"><img src="/assets/images/biz1.jpeg" /></div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="150">
              <div className="biz-card"><img src="/assets/images/biz2.jpeg" /></div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="biz-card"><img src="/assets/images/biz3.jpeg" /></div>
            </div>
          </div>
        </section>

        {/* ----------------------- REVIEWS ------------------------ */}
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

        {/* ----------------------- ABOUT US ------------------------ */}
        <section id="about" className="about-section py-5 text-center text-white" data-aos="fade-up">
          <div className="container">
            <h2 className="fw-bold mb-4">About adNova</h2>
            <p className="fs-5 mx-auto" style={{ maxWidth: "800px" }}>
              adNova bridges the gap between brands and influencers, providing a transparent, secure, and creative platform for smooth collaborations.
            </p>
          </div>
        </section>

        {/* ----------------------- CONTACT ------------------------ */}
        <section id="contact" className="py-5 text-white text-center contact-section" data-aos="fade-up">
          <div className="container">
            <h2 className="fw-bold mb-4">Contact Us</h2>
            <p className="fs-5 mb-3">We’re always here to help.</p>
            <p>Email: <strong>support@adnova.com</strong></p>
            <p>Instagram: <strong>@adnova_official</strong></p>
          </div>
        </section>
      </div>

      {/* ----------------------- SIGNUP MODAL ------------------------ */}
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
                <button className="signup-tab active" id="infTab" onClick={() => switchTab("influencer")}>Influencer</button>
                <button className="signup-tab" id="bizTab" onClick={() => switchTab("business")}>Business</button>
              </div>

              {/* Influencer Form */}
              <form id="influencerForm" className="signup-form needs-validation" noValidate onSubmit={handleInfluencerSignup}>
                <input className="form-control mb-3" placeholder="Full Name" required />
                <input className="form-control mb-3" placeholder="Email Address" type="email" required />
                <input className="form-control mb-3" placeholder="Phone Number" pattern="^\\d{10}$" required />
                <input className="form-control mb-3" placeholder="Password" type="password" minLength={6} required />
                <button className="btn btn-success w-100" type="submit">Create Influencer Account</button>
              </form>

              {/* Business Form */}
              <form id="businessForm" className="signup-form d-none needs-validation" noValidate onSubmit={handleBusinessSignup}>
                <input className="form-control mb-3" placeholder="Business Name" required />
                <input className="form-control mb-3" placeholder="Owner Name" required />
                <input className="form-control mb-3" placeholder="Business Email" type="email" required />
                <input className="form-control mb-3" placeholder="Contact Number" pattern="^\\d{10}$" required />
                <input className="form-control mb-3" placeholder="Password" type="password" required />
                <button className="btn btn-success w-100" type="submit">Create Business Account</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------- LOGIN MODAL ------------------------ */}
      <div className="modal fade" id="loginModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <form
            className="modal-content border-0 shadow-lg needs-validation"
            noValidate
            onSubmit={handleLogin}
            style={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              padding: "25px",
              color: "white",
            }}
          >
            <div className="modal-header border-0">
              <h4 className="modal-title fw-bold">Welcome Back</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <label className="form-label fw-semibold">Email</label>
              <input id="login_email" type="email" className="form-control mb-3" required />

              <label className="form-label fw-semibold">Password</label>
              <input id="login_pass" type="password" className="form-control mb-3" required />

              <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
                Login
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default Landing;
