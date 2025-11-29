import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext'; 

// --- Page Imports ---
import Home from "./pages/home";
import Business from "./pages/BusinessDashboard";
import Influencer from "./pages/InfluencerDashboard";
import ProfileSetup from "./components/ProfileSetup";
import Messages from "./pages/Messages"; 
import Marketplace from "./pages/MarketPlace";
import PublicProfile from "./pages/PublicProfile"; // <--- NEW IMPORT

// --- Protected Route Component ---
const ProtectedRoute = ({ element: Element }) => {
    const { isLoggedIn, isProfileComplete } = useAuth();
    if (!isLoggedIn) return <Navigate to="/" replace />;
    if (!isProfileComplete) return <Navigate to="/profile-setup" replace />;
    return <Element />;
};

function App() {
    const auth = useAuth();
    if (!auth || auth.isLoggedIn === undefined) return <div>Loading Application State...</div>;

    const { role, userId } = auth;

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile-setup" element={<ProfileSetup userRole={role} userId={userId} />} />
                
                {/* --- Protected Routes --- */}
                <Route path="/BusinessDashboard" element={<ProtectedRoute element={Business} />} />
                <Route path="/InfluencerDashboard" element={<ProtectedRoute element={Influencer} />} />
                
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/messages" element={<Messages />} /> 

                {/* --- NEW PUBLIC PROFILE ROUTE --- */}
                <Route path="/profile/:userId" element={<PublicProfile />} />

            </Routes>
        </Router>
    );
}

export default App;