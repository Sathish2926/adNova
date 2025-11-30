import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. Custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from sessionStorage (Unique per tab)
  const [authState, setAuthState] = useState(() => {
    // Changed localStorage to sessionStorage
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        sessionStorage.removeItem('auth');
        return { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
      }
    }
    return { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
  });

  // Effect to sync state changes to sessionStorage
  useEffect(() => {
    if (authState.isLoggedIn) {
        sessionStorage.setItem('auth', JSON.stringify(authState));
    } else {
        sessionStorage.removeItem('auth');
    }
  }, [authState]);

  // Function called on successful login/signup
  const login = (data) => {
    const newState = {
      isLoggedIn: true,
      role: data.role,
      isProfileComplete: data.isProfileComplete,
      userId: data.userId,
      name: data.name,
      email: data.email
    };
    setAuthState(newState);
    // sessionStorage is handled by the useEffect above, but we can set it explicitly here too for immediacy if needed
    sessionStorage.setItem('auth', JSON.stringify(newState));
  };
  
  // Function to update the profile status after completion
  const completeProfile = () => {
      setAuthState(prev => {
          const newState = { ...prev, isProfileComplete: true };
          sessionStorage.setItem('auth', JSON.stringify(newState));
          return newState;
      });
  };

  const logout = () => {
    const newState = { isLoggedIn: false, role: null, isProfileComplete: false, userId: null, name: null, email: null };
    setAuthState(newState);
    sessionStorage.removeItem('auth');
  };

  const value = {
    ...authState,
    login,
    logout,
    completeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};