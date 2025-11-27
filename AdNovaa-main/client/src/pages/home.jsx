import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Services from "../components/services";
import InfluencerSection from "../components/influencerSection";
import BusinessSection from "../components/BusinessSection";
import Reviews from "../components/reviews";
import About from "../components/about";
import Contact from "../components/contact";
import SignupModal from "../components/signupModal";
import LoginModal from "../components/loginModal";
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

  return (
    <>
<Navbar />
  <div className="full-bg">
    <Hero />
    <Services />
    <InfluencerSection />
    <BusinessSection />
    <Reviews />
    <About />
    <Contact />
      </div>
      {/* Modals */}
      <SignupModal />
      <LoginModal handleLogin={handleLogin} />
    </>
  );
};

export default Home; 
