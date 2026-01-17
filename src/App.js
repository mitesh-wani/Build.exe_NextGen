import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CircularProgress, Box } from '@mui/material';

// Import all your pages/components
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import CitizenReport from './pages/CitizenReport';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once when the app loads.
  // It checks Firebase to see if the user is already logged in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user if found
      setLoading(false);    // Stop loading once we know the status
    });
    return () => unsubscribe();
  }, []);

  // Show a loading spinner while checking auth status (prevents flickering)
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      {/* The Header is placed here so it appears on EVERY page */}
      <Header />

      <Routes>
        {/* Public Routes - Anyone can see these */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/report" element={<CitizenReport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Route - Only logged-in users can see the Dashboard */}
        <Route 
          path="/admin" 
          element={
            user ? (
              <AuthorityDashboard /> 
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;