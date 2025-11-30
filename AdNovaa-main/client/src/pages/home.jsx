import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css"; 
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/navbar";
import SignupModal from "../components/signupModal";
import LoginModal from "../components/loginModal";
import Contact from "../components/contact"; 

// Import your images (Adjust paths if needed based on your folder structure)
// Assuming images are in public/assets/images or src/assets/images
// If they are in public, we use direct paths string. 
const img1 = "assets/images/undefined (1).jpeg";
const img2 = "assets/images/undefined (3).jpeg";
const img3 = "assets/images/Photo colorful assortment of gents tshir….jpeg";
const img4 = "assets/images/Animation professionnelle de vos comptes….jpeg";
const img5 = "assets/images/Free photo influencer marketing collage _ Free….jpeg";

const Home = () => {
  useEffect(() => { AOS.init({ duration: 1000 }); }, []);

  return (
    <>
      <Navbar />
      
      <div className="home-wrapper" id="home">
        {/* Glow Effects */}
        <div className="glow-blob blob-top"></div>
        <div className="glow-blob blob-mid"></div>
        <div className="glow-blob blob-bot"></div>

        {/* --- HERO SECTION --- */}
        <section className="hero-container">
          <div className="hero-content" data-aos="fade-up">
            <div className="hero-badge">The Future of Collabs</div>
            <h1 className="hero-title">
              Connect. Collaborate. <br />
              <span>Create Impact.</span>
            </h1>
            <p className="hero-subtitle">
              adNova bridges the gap between ambitious brands and creative influencers. 
              The verified marketplace for secure, transparent growth.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-glow" data-bs-toggle="modal" data-bs-target="#signupModal">
                Get Started Free
              </button>
              <a href="#showcase" className="btn btn-outline">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* --- VISUAL SHOWCASE (BENTO GRID WITH REAL IMAGES) --- */}
        <section className="section-wrapper" id="showcase">
          <div className="section-header" data-aos="fade-up">
            <h2>Real Results, Real People</h2>
            <p>From fashion to tech, find your perfect match.</p>
          </div>

          <div className="bento-grid">
            
            {/* Text Tile */}
            <div className="bento-card text-card" data-aos="fade-right">
              <div className="bento-icon">🚀</div>
              <h4>Instant Matching</h4>
              <p>Our algorithm finds partners based on niche, location, and budget instantly.</p>
            </div>

            {/* Image Tile (Large) */}
            <div className="bento-card image-card large" data-aos="fade-up" style={{backgroundImage: `url('${img5}')`}}>
              <div className="card-overlay">
                <h4>Verified Creators</h4>
                <span>Authentic engagement only.</span>
              </div>
            </div>

            {/* Text Tile */}
            <div className="bento-card text-card" data-aos="fade-left">
              <div className="bento-icon">💬</div>
              <h4>Secure Chat</h4>
              <p>Negotiate deals safely with our encrypted real-time messaging.</p>
            </div>

            {/* Image Tile */}
            <div className="bento-card image-card" data-aos="fade-up" style={{backgroundImage: `url('${img1}')`}}>
               <div className="card-overlay"><h4>Brand Growth</h4></div>
            </div>

            {/* Image Tile */}
            <div className="bento-card image-card" data-aos="fade-up" style={{backgroundImage: `url('${img3}')`}}>
               <div className="card-overlay"><h4>Product Showcases</h4></div>
            </div>

            {/* Text Tile */}
            <div className="bento-card text-card" data-aos="fade-up">
              <div className="bento-icon">🌍</div>
              <h4>Global Reach</h4>
              <p>Connect locally or across the globe.</p>
            </div>

          </div>
        </section>

        {/* --- SPLIT SECTION (Biz vs Inf) --- */}
        <section className="dual-section" id="about">
          <div className="split-panel left" data-aos="fade-right">
            <span className="role-tag">For Businesses</span>
            <h3>Expand Your Reach</h3>
            <p>Stop wasting money on blind ads. Partner with creators who speak directly to your target audience.</p>
            <div className="panel-img-preview" style={{backgroundImage: `url('${img2}')`}}></div>
            <button className="btn btn-outline mt-4" data-bs-toggle="modal" data-bs-target="#signupModal">Join as Business</button>
          </div>
          
          <div className="split-panel right" data-aos="fade-left">
            <span className="role-tag">For Influencers</span>
            <h3>Monetize Your Passion</h3>
            <p>Find brands that align with your values. Secure sponsorships and grow your professional portfolio.</p>
            <div className="panel-img-preview" style={{backgroundImage: `url('${img4}')`}}></div>
            <button className="btn btn-outline mt-4" data-bs-toggle="modal" data-bs-target="#signupModal">Join as Creator</button>
          </div>
        </section>

        <Contact />
      </div>

      <SignupModal />
      <LoginModal />
    </>
  );
};

export default Home;