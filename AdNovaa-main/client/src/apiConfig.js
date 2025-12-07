// This automatically detects if you are on localhost or deployed
const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://adnova-backend.onrender.com"; // You will replace this string after deploying the backend

export default API_BASE_URL;