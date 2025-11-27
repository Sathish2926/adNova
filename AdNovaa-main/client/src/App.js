import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext'; // Import the hook

import Home from "./pages/home";
import Business from "./pages/BusinessDashboard";
import Influencer from "./pages/InfluencerDashboard";
import ProfileSetup from "./components/ProfileSetup";

// Component to enforce login and profile completion rules
const ProtectedRoute = ({ element: Element }) => {
    // Read current user state from the global context
    const { isLoggedIn, role, isProfileComplete } = useAuth();

    if (!isLoggedIn) {
        // 1. If not logged in, redirect to the home/login page
        return <Navigate to="/" replace />; 
    }

    if (!isProfileComplete) {
        // 2. If logged in but profile is NOT complete, force them to the setup page
        // This stops them from accessing the dashboard before profile completion
        return <Navigate to="/profile-setup" replace />;
    }
    
    // 3. If logged in and profile is complete, render the dashboard
    return <Element />;
};

function App() {
    // Get the current user details for passing to ProfileSetup
    const auth = useAuth();
    
    // Safety check: if auth context hasn't loaded, render a basic state
    if (!auth || auth.isLoggedIn === undefined) { 
         // You should see a loading screen briefly while AuthContext loads from localStorage
        return <div>Loading Application State...</div>; 
    }

    const { role, userId } = auth; 
    
    return (
        <Router>
            <Routes>
                {/* Public Route (Login/Signup modals are usually triggered from here) */}
                <Route path="/" element={<Home />} />
                
                {/* Profile Setup Route (Accessible if logged in but incomplete) */}
                <Route 
                    path="/profile-setup" 
                    // Pass the real role and userId from the context
                    element={<ProfileSetup userRole={role} userId={userId} />} 
                />
                
                {/* Protected Dashboard Routes */}
                <Route 
                    path="/BusinessDashboard" 
                    element={<ProtectedRoute element={Business} />}
                />
                <Route 
                    path="/InfluencerDashboard" 
                    element={<ProtectedRoute element={Influencer} />}
                />
            </Routes>
        </Router>
    );
}

export default App;