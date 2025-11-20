import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/home";
import BusinessDashboard from "./pages/BusinessDashboard";



function App() {
  return (
    <Router>
      <Routes>
         <Route path="/"element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/business-dashboard" element={<BusinessDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
