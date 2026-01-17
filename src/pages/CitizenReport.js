import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { CameraAlt, LocationOn, Send } from '@mui/icons-material';

function CitizenReport() {
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // 1. Get User's GPS Location
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => alert("Location permission required!"));
    }
  };

  // 2. Submit Report to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc || !image || !location) {
      alert("Please provide description, photo, and location.");
      return;
    }

    setLoading(true);
    try {
      // Step A: Upload Image to Firebase Storage
      const imageRef = ref(storage, `issues/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Step B: Save Data to Firestore
      await addDoc(collection(db, "issues"), {
        description: desc,
        imageUrl: imageUrl,
        latitude: location.lat,
        longitude: location.lng,
        status: "Pending AI", // Triggers the Cloud Function
        createdAt: serverTimestamp(),
        // Default fields for AI to fill later
        category: "Analyzing...", 
        priority: "Analyzing..."
      });

      setSuccess("Report Submitted! AI is analyzing your issue...");
      setDesc('');
      setImage(null);
      setLocation(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting report.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          📢 Report a Civic Issue
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Description Input */}
          <TextField 
            fullWidth 
            label="Describe the issue (e.g., Deep pothole)" 
            multiline rows={3} 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Location Button */}
          <Button 
            variant={location ? "contained" : "outlined"} 
            color={location ? "success" : "primary"}
            startIcon={<LocationOn />}
            onClick={handleLocation}
            fullWidth
            sx={{ mb: 2 }}
          >
            {location ? "Location Tagged" : "Tag My Location (GPS)"}
          </Button>

          {/* Image Upload */}
          <Button
            variant="contained"
            component="label"
            startIcon={<CameraAlt />}
            fullWidth
            sx={{ mb: 3, bgcolor: '#4caf50' }}
          >
            Upload Photo
            <input 
              type="file" 
              hidden 
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])} 
            />
          </Button>

          {image && <Typography variant="caption">Selected: {image.name}</Typography>}

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth 
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CitizenReport;