import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Business from "./pages/BusinessDashboard";

function App() {
  return (
    <Router>
      <Routes>
         <Route path="/"element={<Home />} />
        <Route path="/BusinessDashboard" element={<Business />}/>
      </Routes>
    </Router>
  );
}

export default App;
