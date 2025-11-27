import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Business from "./pages/BusinessDashboard";
import Messages from "./pages/Messages"; // Import the newly created Messages page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/BusinessDashboard" element={<Business />} />
        <Route path="/messages" element={<Messages />} /> {/* Route to access the inbox */}
      </Routes>
    </Router>
  );
}

export default App;