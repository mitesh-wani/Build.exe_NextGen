import React from 'react';
import { 
  Container, Typography, Button, Box, Grid, Paper, Card, Avatar, useTheme, useMediaQuery 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';

// Icons
import AutoGraphIcon from '@mui/icons-material/AutoGraph';       
import CheckCircleIcon from '@mui/icons-material/CheckCircle';   
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';

// --- ANIMATIONS ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

// --- STYLED COMPONENTS ---
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Deep modern blue-dark
  color: '#fff',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(15),
  position: 'relative',
  overflow: 'hidden',
  clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: '#fff',
  transition: 'all 0.4s ease',
  borderRadius: theme.spacing(3),
  textAlign: 'center',
  padding: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  border: '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

const GradientText = styled(Typography)({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
});

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  '& h3': { 
    fontWeight: '800', 
    fontSize: '2.8rem', 
    marginBottom: 0,
    background: 'linear-gradient(to right, #1976d2, #42a5f5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  '& p': { color: '#555', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px' }
}));

const StepConnector = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '40px',
  left: '50%',
  width: '100%',
  height: '2px',
  borderTop: '2px dashed #e0e0e0',
  zIndex: 0,
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <HeroSection>
        {/* Animated Background Blobs */}
        <Box sx={{
          position: 'absolute', top: '10%', left: '5%', width: 100, height: 100,
          background: 'rgba(255,255,255,0.1)', borderRadius: '50%', animation: `${float} 6s ease-in-out infinite`
        }} />
        <Box sx={{
          position: 'absolute', bottom: '20%', right: '10%', width: 150, height: 150,
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%', animation: `${float} 8s ease-in-out infinite reverse`
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          {/* AI Badge */}
          <Box sx={{ 
            mb: 3, display: 'inline-flex', alignItems: 'center', 
            bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
            px: 2, py: 0.8, borderRadius: 50, border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <BoltIcon fontSize="small" sx={{ mr: 1, color: '#FFD700' }} />
            <Typography variant="subtitle2" fontWeight="bold" letterSpacing={1}>POWERED BY GEMINI AI</Typography>
          </Box>

          {/* Main Headline */}
          <Typography variant="h2" component="h1" fontWeight="900" sx={{ mb: 2, lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Fixing Our City, <br />
            <span style={{ color: '#4fc3f7' }}>Together.</span>
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.85, maxWidth: '650px', mx: 'auto', lineHeight: 1.6, fontWeight: 300 }}>
            UrbanFix transforms civic reporting. Snap a photo of any issue, and our AI instantly 
            identifies, prioritizes, and routes it to the authorities.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} to="/report" 
              variant="contained" size="large" 
              startIcon={<CameraAltIcon />}
              sx={{ 
                px: 5, py: 1.8, fontSize: '1.1rem', borderRadius: 50, 
                bgcolor: '#00e5ff', color: '#000', fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                '&:hover': { bgcolor: '#00b8d4', transform: 'scale(1.05)' },
                transition: 'all 0.2s'
              }}
            >
              Report an Issue
            </Button>
            <Button 
              component={Link} to="/login" 
              variant="outlined" size="large"
              sx={{ 
                px: 5, py: 1.8, fontSize: '1.1rem', borderRadius: 50, 
                borderColor: 'rgba(255,255,255,0.3)', color: 'white', 
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              Official Login
            </Button>
          </Box>
        </Container>
      </HeroSection>

      {/* 2. GLASS STATS BAR */}
      <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 10 }}>
        <GlassCard>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="h3">1,247</Typography>
                <Typography>Active Reports</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox sx={{ borderLeft: { sm: '2px solid rgba(0,0,0,0.05)' }, borderRight: { sm: '2px solid rgba(0,0,0,0.05)' } }}>
                <Typography variant="h3">98%</Typography>
                <Typography>AI Accuracy</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="h3">3.2 Days</Typography>
                <Typography>Avg. Resolution</Typography>
              </StatBox>
            </Grid>
          </Grid>
        </GlassCard>
      </Container>

      {/* 3. PROCESS SECTION */}
      <Container sx={{ py: 12 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2}>WORKFLOW</Typography>
          <GradientText variant="h3" gutterBottom>From Chaos to Clarity</GradientText>
          <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
            We've simplified civic governance into three automated steps using Google's latest AI technology.
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="flex-start" sx={{ position: 'relative' }}>
          
          {/* Connector Line (Desktop Only) */}
          {!isMobile && (
            <Box sx={{ position: 'absolute', top: 55, left: '15%', right: '15%', height: 2, borderTop: '3px dashed #e0e0e0', zIndex: 0 }} />
          )}

          {/* Step 1 */}
          <Grid item xs={12} md={4} sx={{ position: 'relative', zIndex: 1 }}>
            <FeatureCard elevation={0}>
              <Avatar sx={{ 
                width: 90, height: 90, bgcolor: '#e3f2fd', color: '#1565c0', mx: 'auto', mb: 3,
                boxShadow: '0 10px 20px rgba(33, 150, 243, 0.2)' 
              }}>
                <CameraAltIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>1. Snap</Typography>
              <Typography color="text.secondary" lineHeight={1.6}>
                Citizens take a photo. We automatically extract GPS coordinates and timestamp the evidence.
              </Typography>
            </FeatureCard>
          </Grid>

          {/* Step 2 */}
          <Grid item xs={12} md={4} sx={{ position: 'relative', zIndex: 1 }}>
            <FeatureCard elevation={0}>
              <Avatar sx={{ 
                width: 90, height: 90, bgcolor: '#e8f5e9', color: '#2e7d32', mx: 'auto', mb: 3,
                animation: `${pulse} 2s infinite`
              }}>
                <AutoGraphIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>2. Analyze</Typography>
              <Typography color="text.secondary" lineHeight={1.6}>
                Gemini AI scans the image, classifies the issue (e.g. Garbage), and assigns an urgency score.
              </Typography>
            </FeatureCard>
          </Grid>

          {/* Step 3 */}
          <Grid item xs={12} md={4} sx={{ position: 'relative', zIndex: 1 }}>
            <FeatureCard elevation={0}>
              <Avatar sx={{ 
                width: 90, height: 90, bgcolor: '#fff3e0', color: '#ef6c00', mx: 'auto', mb: 3,
                boxShadow: '0 10px 20px rgba(255, 152, 0, 0.2)'
              }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>3. Resolve</Typography>
              <Typography color="text.secondary" lineHeight={1.6}>
                Authorities are notified instantly. Once resolved, they upload proof to close the ticket.
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* 4. CALL TO ACTION FOOTER */}
      <Box sx={{ 
        bgcolor: '#0d47a1', color: 'white', py: 10, textAlign: 'center', 
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1565c0 0%, #0d47a1 100%)' 
      }}>
        <Container maxWidth="sm">
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <SecurityIcon sx={{ fontSize: 60, color: '#4fc3f7', opacity: 0.8 }} />
          </Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Make Your Voice Heard
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.7, fontWeight: 300 }}>
            Join the community of proactive citizens building a better city today.
          </Typography>
          <Button 
            component={Link} to="/report" 
            variant="contained" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              px: 6, py: 2, borderRadius: 50, bgcolor: 'white', color: '#0d47a1', 
              fontWeight: '900', fontSize: '1.2rem',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' },
              transition: 'transform 0.2s'
            }}
          >
            Start Reporting Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;