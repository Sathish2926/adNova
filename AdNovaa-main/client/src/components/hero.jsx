import React from "react";

const Hero = () => {
  return (
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
  );
};

export default Hero;

