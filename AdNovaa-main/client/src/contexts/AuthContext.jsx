import React, { createContext, useContext, useState } from 'react';

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. Custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage or default to logged out
  const [authState, setAuthState] = useState(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        localStorage.removeItem('auth');
        return { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
      }
    }
    return { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
  });

  // Function called on successful login/signup
  const login = (data) => {
    const newState = {
      isLoggedIn: true,
      role: data.role,
      isProfileComplete: data.isProfileComplete,
      userId: data.userId,
      // CAPTURE NAME AND EMAIL HERE
      name: data.name,
      email: data.email
    };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };
  
  // Function to update the profile status after completion
  const completeProfile = () => {
      const newState = { ...authState, isProfileComplete: true };
      setAuthState(newState);
      localStorage.setItem('auth', JSON.stringify(newState));
  };

  const logout = () => {
    const newState = { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
    setAuthState(newState);
    localStorage.removeItem('auth');
  };

  const value = {
    ...authState,
    login,
    logout,
    completeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};