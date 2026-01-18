
import React from 'react';
import { 
  Container, Typography, Button, Box, Grid, Paper, Card, Avatar, useTheme, useMediaQuery,
  IconButton, TextField, InputAdornment, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import AnimatedCounter from '../components/AnimatedCounter';

// --- IMPORTS FOR CHATBOT ---
import ChatBot from '../components/ChatBot';

// --- ICONS (Existing + New Footer Icons) ---
import AutoGraphIcon from '@mui/icons-material/AutoGraph';       
import CheckCircleIcon from '@mui/icons-material/CheckCircle';   
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
// Footer Icons
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import SendIcon from '@mui/icons-material/Send';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

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

// --- FOOTER STYLED COMPONENTS ---
const FooterWrapper = styled(Box)(({ theme }) => ({
  background: '#0B0F19', // Darkest Navy
  color: '#cbd5e1',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  fontFamily: '"Inter", "Roboto", sans-serif',
}));

const FooterHeader = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  '& svg': { color: '#38bdf8' } // Light blue icons
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'block',
  color: '#94a3b8',
  textDecoration: 'none',
  marginBottom: theme.spacing(1.5),
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#38bdf8',
    transform: 'translateX(5px)',
  },
}));

const SocialButton = styled(IconButton)({
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)',
  marginRight: '10px',
  transition: 'all 0.3s',
  '&:hover': {
    background: 'rgba(56, 189, 248, 0.1)',
    color: '#38bdf8',
    borderColor: '#38bdf8',
    transform: 'translateY(-3px)'
  }
});

const NewsletterInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
  },
  '& input': { padding: '12px 14px' }
});

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
            Report Local Issues <br />
            <span style={{ color: '#4fc3f7' }}> Make Your City Better.</span>
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 6, opacity: 0.85, maxWidth: '650px', mx: 'auto', lineHeight: 1.6, fontWeight: 300 }}>
            UrbanFix transforms civic reporting. Snap a photo of any issue, and our AI instantly 
            identifies, prioritizes, and routes it to the authorities.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} to="/signup" 
              variant="contained" size="large" 
             
              sx={{ 
                px: 5, py: 1.8, fontSize: '1.1rem', borderRadius: 50, 
                bgcolor: '#00e5ff', color: '#000', fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                '&:hover': { bgcolor: '#00b8d4', transform: 'scale(1.05)' },
                transition: 'all 0.2s'
              }}
            >
             Get Started
            {<ArrowForwardIcon />}
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
    <AnimatedCounter endValue={1247} />
    <Typography>Active Reports</Typography>
  </StatBox>
</Grid>

<Grid item xs={12} sm={4}>
  <StatBox>
    <AnimatedCounter endValue={98} suffix="%" />
    <Typography>AI Accuracy</Typography>
  </StatBox>
</Grid>

<Grid item xs={12} sm={4}>
  <StatBox>
    <AnimatedCounter endValue={3} suffix=" Days" />
    <Typography>Avg. Resolution</Typography>
  </StatBox>
</Grid>


          </Grid>
        </GlassCard>
      </Container>

      {/* 3. PROCESS SECTION */}
<Box sx={{ py: 12, bgcolor: '#fafafa' }}>
  <Container maxWidth="lg">
    
    {/* Heading */}
    <Box textAlign="center" mb={8}>
      <Typography
        variant="overline"
        color="primary"
        fontWeight="bold"
        letterSpacing={2}
      >
        WORKFLOW
      </Typography>

      <GradientText variant="h3" gutterBottom>
        From Chaos to Clarity
      </GradientText>

      <Typography
        variant="body1"
        color="text.secondary"
        maxWidth="600px"
        mx="auto"
      >
        We've simplified civic governance into three automated steps using
        Google's latest AI technology.
      </Typography>
    </Box>

    {/* LEFT → RIGHT FLOW */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
      }}
    >
      {/* STEP 1 */}
      <FeatureCard sx={{ flex: 1 }}>
        <Avatar
          sx={{
            width: 90,
            height: 90,
            bgcolor: '#e3f2fd',
            color: '#1565c0',
            mx: 'auto',
            mb: 3,
          }}
        >
          <CameraAltIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          1. Snap
        </Typography>

        <Typography color="text.secondary">
          Citizens take a photo. We automatically extract GPS coordinates
          and timestamp the evidence.
        </Typography>
      </FeatureCard>

      {/* ARROW */}
      <ArrowForwardIcon
        sx={{
          fontSize: 40,
          color: '#90caf9',
          display: { xs: 'none', md: 'block' },
        }}
      />

      {/* STEP 2 */}
      <FeatureCard sx={{ flex: 1 }}>
        <Avatar
          sx={{
            width: 90,
            height: 90,
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            mx: 'auto',
            mb: 3,
            animation: `${pulse} 2s infinite`,
          }}
        >
          <AutoGraphIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          2. Analyze
        </Typography>

        <Typography color="text.secondary">
          Gemini AI scans the image, classifies the issue, and assigns an
          urgency score.
        </Typography>
      </FeatureCard>

      {/* ARROW */}
      <ArrowForwardIcon
        sx={{
          fontSize: 40,
          color: '#90caf9',
          display: { xs: 'none', md: 'block' },
        }}
      />

      {/* STEP 3 */}
      <FeatureCard sx={{ flex: 1 }}>
        <Avatar
          sx={{
            width: 90,
            height: 90,
            bgcolor: '#fff3e0',
            color: '#ef6c00',
            mx: 'auto',
            mb: 3,
          }}
        >
          <CheckCircleIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          3. Resolve
        </Typography>

        <Typography color="text.secondary">
          Authorities are notified instantly. Once resolved, they upload
          proof to close the ticket.
        </Typography>
      </FeatureCard>
    </Box>
  </Container>
</Box>


      {/* 4. CALL TO ACTION (CTA) */}
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
            variant="contained" size="large"
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

      {/* 5. NEW FOOTER SECTION (Matches Image) */}
      {/* 5. NEW FOOTER SECTION */}
      <FooterWrapper>
        <Container maxWidth="xl"> {/* Changed to xl for more breathing room */}
          <Grid container spacing={2} justifyContent="space-between">
            
            {/* 1. BRANDING COLUMN */}
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ color: '#4fc3f7', fontSize: 30, mr: 1 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', letterSpacing: 1 }}>
                  URBANFIX
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6, mb: 3, fontSize: '0.8rem' }}>
                Empowering citizens through technology to engage with civic life.
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <SocialButton size="small"><GitHubIcon fontSize="small" /></SocialButton>
                <SocialButton size="small"><TwitterIcon fontSize="small" /></SocialButton>
                <SocialButton size="small"><LinkedInIcon fontSize="small" /></SocialButton>
              </Box>
            </Grid>

            {/* 2. LINKS: CONTACT */}
            <Grid item xs={6} sm={4} md={2}>
              <FooterHeader><EmailIcon fontSize="small"/> Contact</FooterHeader>
              <FooterLink to="#"><Typography variant="body2">support@urbanfix.com</Typography></FooterLink>
              <FooterLink to="#"><Typography variant="body2">+1 (555) 123-4567</Typography></FooterLink>
              <FooterLink to="#"><Typography variant="body2">Bangalore, India</Typography></FooterLink>
            </Grid>

            {/* 3. LINKS: URBANFIX */}
            <Grid item xs={6} sm={4} md={2}>
              <FooterHeader><InfoIcon fontSize="small"/> UrbanFix</FooterHeader>
              <FooterLink to="#">About Us</FooterLink>
              <FooterLink to="#">Features</FooterLink>
              <FooterLink to="#">Feedback</FooterLink>
            </Grid>

            {/* 4. LINKS: RESOURCES */}
            <Grid item xs={6} sm={4} md={2}>
              <FooterHeader><ArticleIcon fontSize="small"/> Resources</FooterHeader>
              <FooterLink to="#">Blog</FooterLink>
              <FooterLink to="#">Documentation</FooterLink>
              <FooterLink to="#">Tutorials</FooterLink>
            </Grid>

            {/* 5. LINKS: LEGAL (Now aligned to the left of Newsletter) */}
            <Grid item xs={6} sm={4} md={2}>
              <FooterHeader><PrivacyTipIcon fontSize="small"/> Legal</FooterHeader>
              <FooterLink to="#">Privacy Policy</FooterLink>
              <FooterLink to="#">Terms of Service</FooterLink>
              <FooterLink to="#">Contributors</FooterLink>
              <FooterLink to="#">Licenses</FooterLink>
            </Grid>

            {/* 6. LINKS: NEWSLETTER */}
            <Grid item xs={12} md={2}>
              <FooterHeader><SendIcon fontSize="small"/> Newsletter</FooterHeader>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, fontSize: '0.8rem' }}>
                Subscribe for updates.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <NewsletterInput fullWidth placeholder="Email" size="small" />
                <Button 
                  variant="contained" 
                  fullWidth
                  size="small"
                  sx={{ 
                    bgcolor: '#38bdf8', color: '#000', fontWeight: 'bold',
                    '&:hover': { bgcolor: '#0ea5e9' } 
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 6 }} />

          {/* FOOTER BOTTOM - FEEDBACK */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
              How was your experience?
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              Your feedback helps us improve UrbanFix for everyone
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <IconButton sx={{ color: '#ef4444', '&:hover': { transform: 'scale(1.2)' } }}><SentimentVeryDissatisfiedIcon fontSize="large"/></IconButton>
              <IconButton sx={{ color: '#f97316', '&:hover': { transform: 'scale(1.2)' } }}><SentimentDissatisfiedIcon fontSize="large"/></IconButton>
              <IconButton sx={{ color: '#eab308', '&:hover': { transform: 'scale(1.2)' } }}><SentimentSatisfiedIcon fontSize="large"/></IconButton>
              <IconButton sx={{ color: '#84cc16', '&:hover': { transform: 'scale(1.2)' } }}><SentimentSatisfiedAltIcon fontSize="large"/></IconButton>
              <IconButton sx={{ color: '#ec4899', '&:hover': { transform: 'scale(1.2)' } }}><SentimentVerySatisfiedIcon fontSize="large"/></IconButton>
            </Box>
          </Box>
        </Container>
      </FooterWrapper>

      {/* --- FLOATING CHATBOT WIDGET --- */}
      <ChatBot />

    </Box>
  );
}

export default LandingPage;