 import React from "react";
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
  const form = e.target.closest("form");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const name = form.querySelector('input[placeholder="Full Name"]').value;
  const email = form.querySelector('input[placeholder="Email Address"]').value;
  const phone = form.querySelector('input[placeholder="Phone Number"]').value;
  const password = form.querySelector('input[placeholder="Password"]').value;
  const role = "influencer"; // hardcoded role

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, phone, password, role }),
});
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    alert("Influencer account created!");
    form.reset();
  } catch (err) {
    alert("Something went wrong! " + err.message);
    console.error(err);
  }
};
 const handleBusinessSignup = async (e) => {
  e.preventDefault();
  const form = e.target.closest("form");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const name = form.querySelector('input[placeholder="Business Name"]').value;
  const email = form.querySelector('input[placeholder="Business Email"]').value;
  const phone = form.querySelector('input[placeholder="Contact Number"]').value;
  const password = form.querySelector('input[placeholder="Password"]').value;
  const role = "business"; // hardcoded role

  try {
   const res = await fetch("http://localhost:5000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, phone, password, role }),
});
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    alert("Business account created!");
    form.reset();
  } catch (err) {
    alert("Something went wrong! " + err.message);
    console.error(err);
  }
};

 const SignupModal = () => {
  return  <div className="modal fade" id="signupModal" tabIndex="-1" aria-hidden="true">
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
               <form id="influencerForm" className="signup-form needs-validation" noValidate onSubmit={handleInfluencerSignup}>
  <input className="form-control mb-3" placeholder="Full Name" pattern="^[a-zA-Z\s]{3,}$" required />
  <div className="invalid-feedback">Enter a valid name (min 3 letters).</div>

  <input className="form-control mb-3" placeholder="Email Address" type="email" required />
  <div className="invalid-feedback">Enter a valid email.</div>

  <input className="form-control mb-3" placeholder="Phone Number" type="tel" pattern="^\d{10}$" required />
  <div className="invalid-feedback">Enter a 10-digit phone number.</div>

  <input className="form-control mb-3" placeholder="Password" type="password" minLength={6} required />
  <div className="invalid-feedback">Password must be at least 6 characters.</div>

  <button className="btn btn-success w-100" type="submit">
    Create Influencer Account
  </button>
</form>


                {/* Business Form */}
                <form id="businessForm" className="signup-form d-none needs-validation" noValidate onSubmit={handleBusinessSignup}>
  <input className="form-control mb-3" placeholder="Business Name" pattern=".{3,}" required />
  <div className="invalid-feedback">Business name must be at least 3 characters.</div>

  <input className="form-control mb-3" placeholder="Owner Name" pattern="^[a-zA-Z\s]{3,}$" required />
  <div className="invalid-feedback">Owner name must be at least 3 letters.</div>

  <input className="form-control mb-3" placeholder="Business Email" type="email" required />
  <div className="invalid-feedback">Enter a valid email.</div>

  <input className="form-control mb-3" placeholder="Contact Number" type="tel" pattern="^\d{10}$" required />
  <div className="invalid-feedback">Enter a 10-digit phone number.</div>

  <input className="form-control mb-3" placeholder="Password" type="password" minLength={6} required />
  <div className="invalid-feedback">Password must be at least 6 characters.</div>

  <button className="btn btn-success w-100" type="submit">
    Create Business Account
  </button>
</form>

              </div>
            </div>
          </div>
        </div>;
};
export default SignupModal;

