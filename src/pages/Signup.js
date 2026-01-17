import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
          Official Registration
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSignup}>
          <TextField
            label="Email" fullWidth required margin="normal"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password" type="password" fullWidth required margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="success" fullWidth size="large" sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Signup;