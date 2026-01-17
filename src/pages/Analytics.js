import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'; // Added query imports
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, Alert } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Icons for KPI Cards
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Analytics({ issuesProp }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH REAL DATA
  useEffect(() => {
    // 1. If props are passed from Dashboard, use them directly
    if (issuesProp && issuesProp.length > 0) {
      setIssues(issuesProp);
      setLoading(false);
    } else {
      // 2. Otherwise, fetch fresh data directly from Firebase
      const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const realData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIssues(realData);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [issuesProp]);

  // --- KPI CALCULATIONS (REAL DATA ONLY) ---
  const totalIssues = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const highPriority = issues.filter(i => i.priority === 'High').length;
  
  // Calculate Resolution Rate (Prevent division by zero)
  const resolutionRate = totalIssues > 0 
    ? Math.round((resolvedCount / totalIssues) * 100) 
    : 0;

  // --- CHART DATA PREPARATION ---

  // 1. Category Bar Data
  const categoryCounts = issues.reduce((acc, issue) => {
    const cat = issue.category || "Unclassified";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(categoryCounts).map(key => ({ name: key, count: categoryCounts[key] }));

  // 2. Priority Pie Data
  const priorityCounts = issues.reduce((acc, issue) => {
    const priority = issue.priority || "Normal";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  
  // Ensure we have keys for Low, Medium, High even if count is 0 (for consistent colors)
  const pieData = [
    { name: 'Low', value: priorityCounts['Low'] || 0 },
    { name: 'Medium', value: priorityCounts['Medium'] || 0 },
    { name: 'High', value: priorityCounts['High'] || 0 },
  ].filter(item => item.value > 0); // Only show segments that have data

  // 3. Weekly Trend (Calculated from Real Timestamps)
  // Note: This requires your Firebase data to have a 'createdAt' field.
  const processTrendData = () => {
    const daysMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
    const trendStats = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    issues.forEach(issue => {
        if (issue.createdAt) {
            // Handle both Firestore Timestamp and string dates
            const date = issue.createdAt.toDate ? issue.createdAt.toDate() : new Date(issue.createdAt);
            if (!isNaN(date)) {
                const dayName = daysMap[date.getDay()];
                trendStats[dayName] += 1;
            }
        }
    });

    return Object.keys(trendStats).map(day => ({
        day, 
        received: trendStats[day],
        // For simplicity in this demo, we aren't tracking "resolution date", 
        // so we omit the "resolved" line or just map it to current resolved count if you had that data.
    }));
  };
  const lineData = processTrendData();

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 1. HEADER SECTION */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" fontWeight="800" color="#1a237e" gutterBottom>
            Analytics Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time performance based on {totalIssues} total reports.
          </Typography>
        </div>
        <Box sx={{ bgcolor: 'white', px: 2, py: 1, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="caption" fontWeight="bold" color="green">
             ● System Live
          </Typography>
        </Box>
      </Box>

      {/* 2. KPI CARDS ROW */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <KPICard 
          title="Total Reports" 
          value={totalIssues} 
          icon={<TrendingUpIcon />} 
          color="#2196f3" 
          trend="Live Data"
        />
        <KPICard 
          title="Pending Issues" 
          value={totalIssues - resolvedCount} 
          icon={<AccessTimeIcon />} 
          color="#ff9800" 
          trend="Action Required"
        />
        <KPICard 
          title="Resolution Rate" 
          value={`${resolutionRate}%`} 
          icon={<CheckCircleOutlineIcon />} 
          color="#4caf50" 
          trend="Performance"
        />
        <KPICard 
          title="Critical Issues" 
          value={highPriority} 
          icon={<WarningAmberIcon />} 
          color="#f44336" 
          trend="High Priority"
        />
      </Grid>

      {issues.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>No data available yet. Start reporting issues to see analytics!</Alert>
      ) : (
        /* 3. MAIN CHARTS GRID */
        <Grid container spacing={3}>
          
          {/* A. WEEKLY TREND (Area Chart) */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 4, height: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Weekly Activity Volume</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="received" stroke="#8884d8" fillOpacity={1} fill="url(#colorReceived)" name="Reports Received" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* B. PRIORITY BREAKDOWN (Pie Chart) */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, height: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Priority Distribution</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                Severity of current reports
              </Typography>
              
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => {
                       let color = "#8884d8";
                       if (entry.name === 'Low') color = "#4caf50";
                       if (entry.name === 'Medium') color = "#ff9800";
                       if (entry.name === 'High') color = "#f44336";
                       return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* C. CATEGORY PERFORMANCE (Bar Chart) */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4, height: 350, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Issues by Category</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#666' }} />
                  <YAxis tick={{ fill: '#666' }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="count" fill="#1976d2" radius={[6, 6, 0, 0]} barSize={50} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}

// --- SUB-COMPONENT: REUSABLE KPI CARD ---
function KPICard({ title, value, icon, color, trend }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ 
        height: '100%', 
        borderRadius: 4, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-5px)' }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${color}20`, color: color }}>
              {icon}
            </Box>
            <Typography variant="caption" sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1 }}>
              {trend}
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}