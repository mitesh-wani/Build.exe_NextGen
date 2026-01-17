<<<<<<< HEAD
import React from 'react';
import { 
  Container, Typography, Button, Box, Grid, Paper, Card, CardContent, Avatar 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Icons
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Snap
import AutoGraphIcon from '@mui/icons-material/AutoGraph';       // Analyze
import CheckCircleIcon from '@mui/icons-material/CheckCircle';   // Resolve
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';

// Custom Styled Components for "Advanced" Look
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
  color: '#fff',
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)', // Angled bottom edge
  position: 'relative',
  overflow: 'hidden'
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  color: '#1976d2', 
  '& h3': { fontWeight: 'bold', fontSize: '2.5rem', marginBottom: 0 },
  '& p': { color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }
}));
=======
import React, { useEffect, useState } from "react";
import {
  Container, Typography, Button, Box, Grid, Paper,
  Card, Avatar, Skeleton
} from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Icons
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";

/* ================= STYLED COMPONENTS ================= */

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
  color: "#fff",
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
  position: "relative",
  overflow: "hidden"
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[10]
  },
  borderRadius: theme.spacing(2),
  textAlign: "center",
  padding: theme.spacing(3)
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  "& h3": { fontWeight: 800, fontSize: "2.4rem", color: "#1976d2" },
  "& p": {
    color: "#555",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "1px"
  }
}));

/* ================= COMPONENT ================= */

export default function LandingPage() {
  const [stats, setStats] = useState(null);

  /* ===== REAL-TIME STATS FROM FIRESTORE ===== */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {
      let total = snapshot.size;
      let resolved = 0;
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "resolved" && data.createdAt && data.resolvedAt) {
          resolved++;
          resolvedCount++;
          totalResolutionTime +=
            data.resolvedAt.toMillis() - data.createdAt.toMillis();
        }
      });

      const avgDays =
        resolvedCount > 0
          ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24)).toFixed(1)
          : "—";

      setStats({
        total,
        resolved,
        avgDays
      });
    });

    return () => unsubscribe();
  }, []);
>>>>>>> dc536509dd6bda1afb5864a21c63082f3c14e1de

  return (
<<<<<<< HEAD
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 1. HERO SECTION */}
      <HeroSection>
        {/* Background Decorative Circle */}
        <Box sx={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', zIndex: 0
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{ mb: 2, display: 'inline-flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 0.5, borderRadius: 5 }}>
            <BoltIcon fontSize="small" sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="body2" fontWeight="bold">Powered by Google Gemini AI</Typography>
          </Box>

          <Typography variant="h2" component="h1" fontWeight="800" gutterBottom sx={{ lineHeight: 1.2 }}>
            Fixing Our City, <br /> One Click at a Time.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            UrbanFix turns your phone into a civic tool. Snap a photo of a pothole or garbage, 
            and let our AI route it instantly to the right authority.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} to="/report" 
              variant="contained" size="large" 
              color="secondary"
              startIcon={<CameraAltIcon />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 50, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
            >
              Report Issue Now
            </Button>
            <Button 
              component={Link} to="/login" 
              variant="outlined" size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 50, borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
=======
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>

      {/* ================= HERO ================= */}
      <HeroSection>
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.1)"
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", textAlign: "center" }}>
          <Box sx={{
            mb: 2,
            display: "inline-flex",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.15)",
            px: 2,
            py: 0.5,
            borderRadius: 5
          }}>
            <BoltIcon sx={{ mr: 1, color: "#FFD700" }} />
            <Typography variant="body2" fontWeight="bold">
              Powered by Google Gemini AI
            </Typography>
          </Box>

          <Typography variant="h2" fontWeight={800} gutterBottom>
            Fixing Our City,<br />One Issue at a Time.
          </Typography>

          <Typography variant="h6" sx={{ mb: 5, opacity: 0.9 }}>
            Report civic issues in seconds. Our AI ensures faster,
            transparent resolution by the right authority.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to="/report"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<CameraAltIcon />}
              sx={{ px: 4, py: 1.5, borderRadius: 50 }}
            >
              Report Issue
            </Button>

            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                color: "white",
                borderColor: "rgba(255,255,255,0.6)"
              }}
>>>>>>> dc536509dd6bda1afb5864a21c63082f3c14e1de
            >
              Authority Login
            </Button>
          </Box>
        </Container>
      </HeroSection>
<<<<<<< HEAD

      {/* 2. LIVE IMPACT STATS (Floating Bar) */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
        <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
          <Grid container divide>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="h3">1,247</Typography>
                <Typography>Issues Reported</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox sx={{ borderLeft: { sm: '1px solid #eee' }, borderRight: { sm: '1px solid #eee' } }}>
                <Typography variant="h3">892</Typography>
                <Typography>Fixed This Month</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="h3">3.2 Days</Typography>
                <Typography>Avg. Resolution Time</Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 3. HOW IT WORKS */}
      <Container sx={{ py: 10 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="overline" color="primary" fontWeight="bold">The Process</Typography>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="#222">How UrbanFix Works</Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
            From chaos to clarity in three simple steps. We bridge the gap between citizens and the government.
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="center">
          {/* Step 1 */}
          <Grid item xs={12} md={4}>
            <FeatureCard elevation={0} sx={{ border: '1px solid #eee' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#e3f2fd', color: '#1976d2', mx: 'auto', mb: 2 }}>
                <CameraAltIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>1. Snap & Upload</Typography>
              <Typography color="text.secondary">
                See a problem? Take a photo. We auto-tag your GPS location so authorities know exactly where to go.
              </Typography>
            </FeatureCard>
          </Grid>

          {/* Step 2 */}
          <Grid item xs={12} md={4}>
            <FeatureCard elevation={0} sx={{ border: '1px solid #eee', bgcolor: '#e8f5e9' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#c8e6c9', color: '#2e7d32', mx: 'auto', mb: 2 }}>
                <AutoGraphIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>2. AI Analysis</Typography>
              <Typography color="text.secondary">
                Our Gemini AI instantly classifies the issue (e.g., "Pothole") and assigns a priority score (High/Low).
              </Typography>
            </FeatureCard>
          </Grid>

          {/* Step 3 */}
          <Grid item xs={12} md={4}>
            <FeatureCard elevation={0} sx={{ border: '1px solid #eee' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#fff3e0', color: '#f57c00', mx: 'auto', mb: 2 }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>3. Resolved</Typography>
              <Typography color="text.secondary">
                Authorities get a dashboard alert. Once fixed, they upload proof, and you get notified instantly.
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* 4. FOOTER CALL TO ACTION */}
      <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <SecurityIcon sx={{ fontSize: 50, color: '#90caf9', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to make a difference?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Join thousands of citizens improving their neighborhoods today.
          </Typography>
          <Button 
            component={Link} to="/report" 
            variant="contained" 
            color="primary" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 5, py: 1.5, borderRadius: 50, bgcolor: 'white', color: '#1a237e', fontWeight: 'bold', '&:hover': { bgcolor: '#e3f2fd' } }}
=======

      {/* ================= LIVE STATS ================= */}
      <Container maxWidth="lg" sx={{ mt: -8, position: "relative", zIndex: 2 }}>
        <Paper elevation={6} sx={{ borderRadius: 4, p: 3 }}>
          <Grid container>
            {["Issues Reported", "Resolved", "Avg Resolution (Days)"].map((label, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <StatBox>
                  {!stats ? (
                    <Skeleton variant="text" width={80} height={50} />
                  ) : (
                    <Typography variant="h3">
                      {i === 0 && stats.total}
                      {i === 1 && stats.resolved}
                      {i === 2 && stats.avgDays}
                    </Typography>
                  )}
                  <Typography>{label}</Typography>
                </StatBox>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ================= HOW IT WORKS ================= */}
      <Container sx={{ py: 10 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="overline" color="primary" fontWeight="bold">
            The Process
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            How UrbanFix Works
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { icon: <CameraAltIcon />, title: "Snap & Upload", desc: "Capture the issue with GPS tagging." },
            { icon: <AutoGraphIcon />, title: "AI Analysis", desc: "Gemini AI classifies and prioritizes." },
            { icon: <CheckCircleIcon />, title: "Resolved", desc: "Authorities fix and upload proof." }
          ].map((step, i) => (
            <Grid item xs={12} md={4} key={i}>
              <FeatureCard>
                <Avatar sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}>
                  {step.icon}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {step.title}
                </Typography>
                <Typography color="text.secondary">
                  {step.desc}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= FOOTER CTA ================= */}
      <Box sx={{ bgcolor: "#1a237e", color: "white", py: 8, textAlign: "center" }}>
        <Container maxWidth="sm">
          <SecurityIcon sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Ready to Improve Your City?
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 4 }}>
            Join citizens and authorities working together in real time.
          </Typography>
          <Button
            component={Link}
            to="/report"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 5, py: 1.5, borderRadius: 50 }}
>>>>>>> dc536509dd6bda1afb5864a21c63082f3c14e1de
          >
            Start Reporting
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
