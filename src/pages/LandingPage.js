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

  return (
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
            >
              Authority Login
            </Button>
          </Box>
        </Container>
      </HeroSection>

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
          >
            Start Reporting
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
