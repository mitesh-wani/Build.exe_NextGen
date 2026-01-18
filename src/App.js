import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { CircularProgress, Box } from "@mui/material";
import Contact from "./pages/Contact";


// Common Components
import Header from "./components/Header";

// Public Pages
import LandingPage from "./pages/LandingPage";
import CitizenReport from "./pages/CitizenReport";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin Pages
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Issues from "./pages/Issues";
import MapView from "./pages/MapView";
import Analytics from "./pages/Analytics";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state once app loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Prevent UI flicker while auth is loading
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      {/* Header visible on all pages */}
      <Header />

      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/report" element={<CitizenReport />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/admin" />} />

        {/* ===== PROTECTED ADMIN ROUTES ===== */}
        <Route
          path="/admin"
          element={user ? <AuthorityDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/issues"
          element={user ? <Issues /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/map"
          element={user ? <MapView /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/analytics"
          element={user ? <Analytics /> : <Navigate to="/login" replace />}
        />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
