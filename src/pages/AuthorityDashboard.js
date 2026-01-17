import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Grid, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Link, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText 
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

// Import Your Other Pages
import Issues from './Issues';
import MapView from './MapView';
import Analytics from './Analytics';

function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [currentView, setCurrentView] = useState('Dashboard');
  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching issues:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const resolveIssue = async (id) => {
    try {
      const proofUrl = prompt("Enter Proof URL (or leave empty for demo):", "http://via.placeholder.com/150");
      
      // If user cancels the prompt, proofUrl will be null
      if (proofUrl === null) {
        return; // User cancelled
      }
      
      // Update the document
      const issueRef = doc(db, "issues", id);
      await updateDoc(issueRef, {
        status: "Resolved",
        resolutionProof: proofUrl || "http://via.placeholder.com/150",
        resolvedAt: new Date().toISOString()
      });
      
      console.log("Issue resolved successfully!");
      
    } catch (error) {
      console.error("Error resolving issue:", error);
      alert(`Failed to resolve issue: ${error.message}`);
    }
  };

  // Stats Calculation
  const newIssues = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const pending = newIssues - resolved;

  // Sidebar Menu Items Config
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'Dashboard' },
    { text: 'Issues', icon: <ListIcon />, view: 'Issues' },
    { text: 'Map', icon: <MapIcon />, view: 'Map' },
    { text: 'Analytics', icon: <BarChartIcon />, view: 'Analytics' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      
      {/* --- SIDEBAR --- */}
      <Box sx={{ width: 250, bgcolor: '#0d1b2a', color: 'white', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
        
        {/* Logo Area */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <DashboardIcon sx={{ mr: 1, color: '#4fc3f7' }} /> 
          <Typography variant="h6" fontWeight="bold">UrbanFix</Typography>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => setCurrentView(item.view)}
                selected={currentView === item.view}
                sx={{ 
                  borderRadius: 2, 
                  '&.Mui-selected': { bgcolor: 'rgba(79, 195, 247, 0.2)', borderLeft: '4px solid #4fc3f7' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <ListItemIcon sx={{ color: currentView === item.view ? '#4fc3f7' : 'rgba(255,255,255,0.7)' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: currentView === item.view ? 'white' : 'rgba(255,255,255,0.7)' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Logout Button in Sidebar */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#ef5350' }}>
            <ListItemIcon sx={{ color: '#ef5350' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Box>

      {/* --- MAIN CONTENT AREA --- */}
      <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
        
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Typography variant="h5" fontWeight="bold" color="#1a237e">
            {currentView === 'Dashboard' ? 'Municipal Overview' : currentView}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
             <Chip label="Admin Access" color="primary" size="small" variant="outlined"/>
          </Box>
        </Box>

        {/* --- DYNAMIC CONTENT SWITCHER --- */}
        
        {/* VIEW 1: DASHBOARD (Default Stats & Table) */}
        {currentView === 'Dashboard' && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '5px solid #1976d2' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Issues</Typography>
                  <Typography variant="h3" fontWeight="bold">{newIssues}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '5px solid #ffa726' }}>
                  <Typography variant="subtitle2" color="text.secondary">In Progress</Typography>
                  <Typography variant="h3" fontWeight="bold">{pending}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '5px solid #66bb6a' }}>
                  <Typography variant="subtitle2" color="text.secondary">Resolved</Typography>
                  <Typography variant="h3" fontWeight="bold">{resolved}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#eceff1' }}>
                <Typography variant="subtitle1" fontWeight="bold">Recent Activity</Typography>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Evidence</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.slice(0, 5).map((issue) => (
                    <TableRow key={issue.id} hover>
                      <TableCell>
                        {issue.imageUrl ? (
                          <Link href={issue.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={issue.imageUrl} alt="proof" width="40" height="40" style={{borderRadius: 5}}/>
                          </Link>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell>{issue.category || "N/A"}</TableCell>
                      <TableCell>
                        <Chip 
                          label={issue.priority || "N/A"} 
                          color={issue.priority === 'High' ? 'error' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={issue.status || "Pending"} 
                          color={issue.status === 'Resolved' ? 'success' : 'default'} 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {issue.status !== 'Resolved' && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success" 
                            onClick={() => resolveIssue(issue.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

        {/* VIEW 2: ISSUES (Full List) */}
        {currentView === 'Issues' && <Issues />}

        {/* VIEW 3: MAP */}
        {currentView === 'Map' && <MapView />}

        {/* VIEW 4: ANALYTICS */}
        {currentView === 'Analytics' && <Analytics />}

      </Box>
    </Box>
  );
}

export default AuthorityDashboard;