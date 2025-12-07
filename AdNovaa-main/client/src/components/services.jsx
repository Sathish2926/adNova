// ==============================
// FILE: D:\CC\adNova\AdNovaa-main\client\src\components\services.jsx
// ==============================
import React from "react";

const Services = () => {
  return (
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
              <p>Grow your brand with analytics, reporting and influencer tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Services;