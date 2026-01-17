
import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Card, CardMedia, CardContent, Chip } from '@mui/material';

// --- CONFIGURATION ---
const containerStyle = {
  width: '100%',
  height: '80vh', // Takes up 80% of the screen height
  borderRadius: '15px'
};

// Default center (Update this to your city's coordinates!)
const defaultCenter = {
  lat: 19.0760, // Example: Mumbai
  lng: 72.8777
};

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null); // Which marker is clicked?

  // 1. Load the Google Maps API Script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDUtKOFnOnkgo-W0jBu9WK93_kKXRqM8QA" // <--- PASTE YOUR KEY HERE
  });

  // 2. Fetch Real Data from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {
      const issuesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(issue => issue.latitude && issue.longitude); // Only keep issues with GPS
      setIssues(issuesData);
    });
    return () => unsubscribe();
  }, []);

  if (!isLoaded) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#1a237e' }}>
        Live Issue Heatmap
      </Typography>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={{ disableDefaultUI: false, zoomControl: true }}
      >
        {/* 3. Render Markers for each issue */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={{ lat: issue.latitude, lng: issue.longitude }}
            onClick={() => setSelectedIssue(issue)}
          />
        ))}

        {/* 4. Show Popup Window when a marker is clicked */}
        {selectedIssue && (
          <InfoWindow
            position={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
            onCloseClick={() => setSelectedIssue(null)}
          >
            <Card sx={{ maxWidth: 200, boxShadow: 'none' }}>
              {selectedIssue.imageUrl && (
                <CardMedia
                  component="img"
                  height="100"
                  image={selectedIssue.imageUrl}
                  alt="Issue"
                  sx={{ borderRadius: 1 }}
                />
              )}
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedIssue.category || "Report"}
                </Typography>
                <Chip 
                  label={selectedIssue.status} 
                  color={selectedIssue.status === 'Resolved' ? 'success' : 'warning'} 
                  size="small" 
                  sx={{ mt: 0.5, fontSize: '0.7rem' }} 
                />
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
}