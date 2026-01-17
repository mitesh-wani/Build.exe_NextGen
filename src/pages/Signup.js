import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore with AUTHORITY role
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        name: name || 'Authority User',
        phone: phone || '',
        role: 'authority', // SET AS AUTHORITY
        createdAt: new Date().toISOString()
      });

      navigate('/admin');
    } catch (err) {
      console.error('Signup error:', err);
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
            label="Full Name" 
            fullWidth 
            margin="normal"
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone Number" 
            fullWidth 
            margin="normal"
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Official Email" 
            type="email"
            fullWidth 
            required 
            margin="normal"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password" 
            type="password" 
            fullWidth 
            required 
            margin="normal"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="success" fullWidth size="large" sx={{ mt: 2 }}>
            Register as Authority
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Signup;