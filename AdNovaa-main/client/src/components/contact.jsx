import React from "react";

const Contact = () => {
  return (
    <section id="contact" className="py-5 text-center" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
        <div className="container" data-aos="fade-up">
          <h2 className="fw-bold mb-4" style={{color:'white'}}>Ready to start?</h2>
          <p className="fs-5 mb-4 text-muted">Join thousands of brands and creators on adNova.</p>
          
          <div className="d-flex justify-content-center gap-4 mb-5">
             <div>
                <strong className="d-block text-white">Email</strong>
                <span className="text-muted">support@adnova.com</span>
             </div>
             <div>
                <strong className="d-block text-white">Socials</strong>
                <span className="text-muted">@adnova_official</span>
             </div>
          </div>
          
          <p className="small text-muted">© 2025 adNova. All rights reserved.</p>
        </div>
      </section>
  );
};
export default Contact;