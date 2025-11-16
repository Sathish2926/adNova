import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
useEffect(() => {
  const target = document.querySelector(".service-loop");

  if (!target) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      target.classList.add("show");
    }
  }, { threshold: 0.2 });

  observer.observe(target);


}, []);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Go to Signup Page
  const goToSignup = () => {
    navigate("/Signup");
  };

  // Go to Login Modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

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
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
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
 <div className="full-bg">
      {/* Hero Section */}
    <section className="hero-section text-center text-white d-flex align-items-center justify-content-center" data-aos="fade-up">
    <div className="container" data-aos="fade-up">
          <h1 className="display-4 fw-bold">
            Connecting Businesses with the Right Influencers
          </h1>
          <p className="lead mt-3 mb-4">
            adNova helps brands find influencers who match their audience, vision & goals.
          </p>
          <a href="#" className="btn btn-light btn-lg me-2">Find Influencers</a>
          <a href="#" className="btn btn-outline-light btn-lg">Join as Influencer</a>
        </div>
      </section>

      {/* Services Section */}
<section class="services-section">
  <div class="container text-center">
    <h2 class="mb-5">Our Services</h2>

    <div class="row g-5">

      <div class="col-md-4" data-aos="fade-up">
        <div class="service-box">
          <h4>Business Promotion</h4>
          <p>Promote your business through verified influencers and gain authentic visibility.</p>
        </div>
      </div>

      <div class="col-md-4" data-aos="fade-up" data-aos-delay="200">
        <div class="service-box">
          <h4>Secure Collabs</h4>
          <p>Safe, transparent collaboration with influencers for honest results.</p>
        </div>
      </div>

      <div class="col-md-4" data-aos="fade-up" data-aos-delay="400">
        <div class="service-box">
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
    </>
  );
};

export default Home;
// import { useEffect } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./home.css";

// export default function Home() {

//   useEffect(() => {
//     AOS.init({
//       duration: 900,
//       once: false,
//       easing: "ease-in-out",
//     });
//   }, []);

//   return (
//     <div className="home-wrapper">

//       {/* HERO SECTION */}
//       <section className="hero-section parallax-bg d-flex align-items-center justify-content-center">
//         <h1 data-aos="fade-up" className="display-1 fw-bold text-white">
//           adNova
//         </h1>
//       </section>

//       {/* ABOUT INFLUENCERS */}
//       <section className="container py-5">
//         <div className="row align-items-center">

//           <div className="col-md-6" data-aos="fade-left">
//             <h3 className="text-white fw-bold">About the Influencers</h3>
//             <p className="text-light">
//               Smart, creative individuals ready to boost your brand with high-engagement content.
//             </p>
//           </div>

//           <div className="col-md-6 d-flex gap-3 flex-wrap justify-content-center" data-aos="fade-right">
//             <img src="/img/inf1.jpg" className="info-img" />
//             <img src="/img/inf2.jpg" className="info-img" />
//             <img src="/img/inf3.jpg" className="info-img" />
//           </div>

//         </div>
//       </section>

//       {/* ABOUT BUSINESSES */}
//       <section className="container py-5">

//         <h3 className="text-white fw-bold mb-4" data-aos="fade-up">About the Businesses</h3>

//         <div className="row g-4">
//           <div className="col-md-4" data-aos="fade-up" data-aos-delay="0">
//             <div className="biz-card"></div>
//           </div>

//           <div className="col-md-4" data-aos="fade-up" data-aos-delay="150">
//             <div className="biz-card"></div>
//           </div>

//           <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
//             <div className="biz-card"></div>
//           </div>
//         </div>

//       </section>

//       {/* USER REVIEWS */}
//       <section className="container py-5">
//         <h3 className="text-white fw-bold mb-4" data-aos="fade-up">User Reviews</h3>

//         <div className="row g-4">
//           <div className="col-md-6" data-aos="zoom-in">
//             <div className="review-card p-4">"A perfect piece of design!"</div>
//           </div>

//           <div className="col-md-6" data-aos="zoom-in">
//             <div className="review-card p-4">"The smartest tool out there!"</div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
