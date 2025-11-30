import React from "react";

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

const handleInfluencerSignup = async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  // Uses IDs for safety
  const name = document.getElementById("inf_name").value;
  const email = document.getElementById("inf_email").value;
  const password = document.getElementById("inf_pass").value;
  const role = "influencer";

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    alert("Influencer account created! Please Login.");
    // Optionally close modal here
  } catch (err) {
    alert("Signup Failed: " + err.message);
  }
};

const handleBusinessSignup = async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  // FIXED: Using IDs to ensure we get the right data
  const businessName = document.getElementById("biz_name").value;
  const email = document.getElementById("biz_email").value;
  const password = document.getElementById("biz_pass").value;
  const role = "business";

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Mapping 'businessName' to 'name' for the User model
        body: JSON.stringify({ name: businessName, email, password, role }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    alert("Business account created! Please Login.");
  } catch (err) {
    alert("Signup Failed: " + err.message);
  }
};

const SignupModal = () => {
  return (
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
              <input id="inf_name" className="form-control mb-3" placeholder="Full Name" required />
              <input id="inf_email" className="form-control mb-3" placeholder="Email Address" type="email" required />
              <input id="inf_phone" className="form-control mb-3" placeholder="Phone Number" type="tel" />
              <input id="inf_pass" className="form-control mb-3" placeholder="Password" type="password" minLength={6} required />
              <button className="btn btn-primary w-100" type="submit">Create Influencer Account</button>
            </form>

            {/* Business Form (FIXED IDs) */}
            <form id="businessForm" className="signup-form d-none needs-validation" noValidate onSubmit={handleBusinessSignup}>
              <input id="biz_name" className="form-control mb-3" placeholder="Business Name" required />
              <input id="biz_owner" className="form-control mb-3" placeholder="Owner Name" />
              <input id="biz_email" className="form-control mb-3" placeholder="Business Email" type="email" required />
              <input id="biz_phone" className="form-control mb-3" placeholder="Contact Number" type="tel" />
              <input id="biz_pass" className="form-control mb-3" placeholder="Password" type="password" minLength={6} required />
              <button className="btn btn-primary w-100" type="submit">Create Business Account</button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;