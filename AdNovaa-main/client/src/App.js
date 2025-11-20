import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/InfluencerSignup";
import Home from "./pages/home";


function App() {
  return (
    <Router>
      <Routes>
         <Route path="/"element={<Home />} />
      
      </Routes>
    </Router>
  );
}

export default App;
