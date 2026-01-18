import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ConstructionIcon from '@mui/icons-material/Construction';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // HIDE HEADER IF ON ADMIN DASHBOARD
  if (location.pathname === '/admin') {
    return null; 
  }

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
      <Container>
        <Toolbar disableGutters>
          <ConstructionIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#1976d2' }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: '#1976d2',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            URBANFIX
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} to="/" color="inherit">Home</Button>
            
            
            {/* --- NEW ADDITION HERE --- */}
            <Button component={Link} to="/contact" color="inherit">Contact Us</Button>
            {/* ------------------------- */}
            
            {user ? (
              <>
                <Button component={Link} to="/admin" color="primary" variant="outlined">Dashboard</Button>
                <Button onClick={handleLogout} color="error">Logout</Button>
              </>
            ) : (
              <Button component={Link} to="/login" variant="contained" color="primary">
                Authority Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;