import {useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import API_BASE_URL from "../apiConfig";
const ResetPassword=()=>{
const {token}=useParams();
const navigate=useNavigate();
const [password,setPassword]=useState("");
const [confirmPassword,setConfirmPassword]=useState("");
const [message,setMessage]=useState("");
const [error,setError]=useState("");
const [loading,setLoading]=useState(false);
const handleSubmit=async(e)=>{
e.preventDefault();
setMessage("");
setError("");
if(password!==confirmPassword){setError("Passwords do not match");return;}
setLoading(true);
try{
const response=await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
const contentType=response.headers.get("content-type");
let data;
if(contentType&&contentType.indexOf("application/json")!==-1){data=await response.json();}else{throw new Error("Server returned non-JSON response.");}
if(response.ok){alert("Password reset successfully!");navigate("/");}else{setError(data.message||"Error resetting password");}
}catch(err){console.error(err);setError(err.message||"Connection failed.");}finally{setLoading(false);}
};
return(
<div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor:"#030b25"}}>
<div className="card p-4 shadow-lg border-0" style={{width:"100%",maxWidth:"400px",borderRadius:"18px",background:"linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",border:"1px solid rgba(255,255,255,0.1)",color:"white"}}>
<h3 className="text-center mb-4 fw-bold" style={{color:"white"}}>Reset Password</h3>
{error&&<div className="alert alert-danger py-2" role="alert">{error}</div>}
{message&&<div className="alert alert-success py-2" role="alert">{message}</div>}
<form onSubmit={handleSubmit}>
<div className="mb-3">
<label className="form-label fw-semibold">New Password</label>
<input type="password" className="form-control p-3" placeholder="Enter new password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} style={{background:"#020617",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"white"}}/>
</div>
<div className="mb-4">
<label className="form-label fw-semibold">Confirm Password</label>
<input type="password" className="form-control p-3" placeholder="Confirm password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required style={{background:"#020617",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"white"}}/>
</div>
<button type="submit" className="btn w-100 py-3 fw-bold" disabled={loading} style={{background:"linear-gradient(135deg, #6366F1, #4F46E5)",borderRadius:"12px",border:"none",color:"white",textTransform:"uppercase",letterSpacing:"1px"}}>
{loading?"Updating...":"Update Password"}
</button>
</form>
</div>
</div>
);
};
export default ResetPassword;