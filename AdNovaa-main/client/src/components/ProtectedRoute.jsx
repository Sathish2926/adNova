import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const role = localStorage.getItem('userRole');
  if (!role) return <Navigate to='/' replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to='/home' replace />;
  return children;
}
