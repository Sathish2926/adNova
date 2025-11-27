import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing/Landing';
import HomeFeed from './pages/Feed/HomeFeed';
import BusinessDashboard from './pages/Business/BusinessDashboard';
import InfluencerDashboard from './pages/Influencer/InfluencerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeFeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business-dashboard"
          element={
            <ProtectedRoute requiredRole="business">
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/influencer-dashboard"
          element={
            <ProtectedRoute requiredRole="influencer">
              <InfluencerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
