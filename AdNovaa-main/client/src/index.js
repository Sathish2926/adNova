//client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <AuthProvider> {/* <--- THIS MUST WRAP APP! */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);