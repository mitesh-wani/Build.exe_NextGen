import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#e3f2fd', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="#0d47a1">
            Fixing Our City, Together.
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            UrbanFix uses AI to instantly classify and route civic issues to the right authorities. 
            Report a pothole, broken light, or garbage in seconds.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              component={Link} to="/report" 
              variant="contained" size="large" 
              sx={{ mr: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Report an Issue
            </Button>
            <Button 
              component={Link} to="/login" 
              variant="outlined" size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Authority Access
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#f5f5f5' }}>
              <ReportProblemIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Snap & Report</Typography>
              <Typography>Simply take a photo. Our system automatically tags your location and identifies the problem.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#f5f5f5' }}>
              <AutoGraphIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" gutterBottom>AI Powered</Typography>
              <Typography>Google Gemini AI analyzes the image to prioritize urgent issues and remove duplicates.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#f5f5f5' }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Real-time Updates</Typography>
              <Typography>Track the status of your complaint from "Reported" to "Resolved" with photo proof.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;