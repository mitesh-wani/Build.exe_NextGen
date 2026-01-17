import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); // Redirect to dashboard after login
    } catch (err) {
      setError("Failed to login. Check your email/password.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
          Authority Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleLogin}>
          <TextField
            label="Official Email" fullWidth required margin="normal"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password" type="password" fullWidth required margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            New Official? <Link to="/signup">Register here</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;