import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CitizenReport from './pages/CitizenReport';
import AuthorityDashboard from './pages/AuthorityDashboard';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            UrbanFix 🚧
          </Typography>
          <Button color="inherit" component={Link} to="/">Citizen App</Button>
          <Button color="inherit" component={Link} to="/admin">Authority Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<CitizenReport />} />
        <Route path="/admin" element={<AuthorityDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;