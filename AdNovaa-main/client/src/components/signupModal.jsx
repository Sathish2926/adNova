// ==============================
// FILE: client/src/components/signupModal.jsx
// ==============================
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; 
// CHANGED: Import API Config
import API_BASE_URL from "../apiConfig";

// Helper to switch tabs
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

const SignupModal = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); 

  const closeBootstrapModal = () => {
    const modalElement = document.getElementById('signupModal');
    if (modalElement) {
        if (window.bootstrap && window.bootstrap.Modal) {
            const instance = window.bootstrap.Modal.getInstance(modalElement);
            if(instance) instance.hide();
            else new window.bootstrap.Modal(modalElement).hide();
        } else {
            // Fallback
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            const backdrop = document.querySelector('.modal-backdrop');
            if(backdrop) backdrop.remove();
        }
    }
  };

  const handleInfluencerSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const name = document.getElementById("inf_name").value;
    const email = document.getElementById("inf_email").value;
    const phone = document.getElementById("inf_phone").value; // Capture Phone
    const password = document.getElementById("inf_pass").value;
    const role = "influencer";
    try {
      // CHANGED: Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      login(data);
      closeBootstrapModal();
      navigate('/profile-setup');
    } catch (err) {
      console.error("Signup Failed: ", err.message);
      alert(err.message);
    }
  };

  const handleBusinessSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const businessName = document.getElementById("biz_name").value;
    const ownerName = document.getElementById("biz_owner").value;
    const email = document.getElementById("biz_email").value;
    const phone = document.getElementById("biz_phone").value;
    const password = document.getElementById("biz_pass").value;
    const role = "business";
    try {
      // CHANGED: Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessName, ownerName, email, password, role, phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      login(data);
      closeBootstrapModal();
      navigate('/profile-setup');
    } catch (err) {
      console.error("Signup Failed: ", err.message);
      alert(err.message);
    }
  };

  const tabStyle = {
    flex: 1, padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', transition: '0.3s', textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8'
  };
  const activeTabStyle = {
    ...tabStyle,
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white', borderColor: 'transparent',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
  };

  return (
    <div className="modal fade" id="signupModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Create Your Account</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body p-4">
           
            <div className="d-flex gap-3 mb-4">
              <div id="infTab" className="active"
                onClick={(e) => {
                    switchTab("influencer");
                    e.currentTarget.style.cssText = `flex: 1; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center; background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);`;
                    document.getElementById("bizTab").style.cssText = `flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center; background: rgba(255, 255, 255, 0.05); color: #94a3b8;`;
                }}
                style={activeTabStyle}>INFLUENCER</div>
              <div id="bizTab" onClick={(e) => {
                    switchTab("business");
                    e.currentTarget.style.cssText = `flex: 1; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center; background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);`;
                    document.getElementById("infTab").style.cssText = `flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center; background: rgba(255, 255, 255, 0.05); color: #94a3b8;`;
                }}
                style={tabStyle}>BUSINESS</div>
            </div>

            <form id="influencerForm" className="needs-validation" noValidate onSubmit={handleInfluencerSignup}>
              <div className="mb-3"><label className="form-label text-white">Full Name</label><input id="inf_name" className="form-control" required /></div>
              <div className="mb-3"><label className="form-label text-white">Email</label><input id="inf_email" className="form-control" type="email" required /></div>
              <div className="mb-3"><label className="form-label text-white">Phone</label><input id="inf_phone" className="form-control" type="tel" /></div>
              <div className="mb-4"><label className="form-label text-white">Password</label><input id="inf_pass" className="form-control" type="password" minLength={6} required /></div>
              <button className="btn btn-primary w-100 py-3" type="submit">Create Influencer Account</button>
            </form>

            <form id="businessForm" className="d-none needs-validation" noValidate onSubmit={handleBusinessSignup}>
              <div className="mb-3"><label className="form-label text-white">Business Name</label><input id="biz_name" className="form-control" required /></div>
              <div className="mb-3"><label className="form-label text-white">Owner Name</label><input id="biz_owner" className="form-control" /></div>
              <div className="mb-3"><label className="form-label text-white">Email</label><input id="biz_email" className="form-control" type="email" required /></div>
              <div className="mb-3"><label className="form-label text-white">Contact</label><input id="biz_phone" className="form-control" type="tel" /></div>
              <div className="mb-4"><label className="form-label text-white">Password</label><input id="biz_pass" className="form-control" type="password" minLength={6} required /></div>
              <button className="btn btn-primary w-100 py-3" type="submit">Create Business Account</button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;