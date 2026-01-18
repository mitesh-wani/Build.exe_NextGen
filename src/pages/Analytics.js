import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert
} from '@mui/material';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// KPI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Analytics({ issuesProp }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (issuesProp && issuesProp.length > 0) {
      setIssues(issuesProp);
      setLoading(false);
    } else {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIssues(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [issuesProp]);

  // ================= KPI METRICS =================
  const totalIssues = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = totalIssues > 0
    ? Math.round((resolvedCount / totalIssues) * 100)
    : 0;

  // ================= CATEGORY DATA =================
  const categoryCounts = issues.reduce((acc, issue) => {
    const cat = issue.category || 'Unclassified';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(categoryCounts).map(key => ({
    name: key,
    count: categoryCounts[key]
  }));

  // ================= PRIORITY DATA =================
  const priorityCounts = { Low: 0, Medium: 0, High: 0, Unspecified: 0 };

  issues.forEach(issue => {
    let p = issue.priority;
    if (!p) return priorityCounts.Unspecified++;
    p = p.toLowerCase();
    if (p === 'low') priorityCounts.Low++;
    else if (p === 'medium') priorityCounts.Medium++;
    else if (p === 'high') priorityCounts.High++;
    else priorityCounts.Unspecified++;
  });

  const pieData = [
    { name: 'Low', value: priorityCounts.Low },
    { name: 'Medium', value: priorityCounts.Medium },
    { name: 'High', value: priorityCounts.High },
    { name: 'Unspecified', value: priorityCounts.Unspecified }
  ].filter(d => d.value > 0);

  const COLORS = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444',
    Unspecified: '#94a3b8'
  };

  // ================= WEEKLY TREND =================
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const trendStats = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };

  issues.forEach(issue => {
    if (!issue.createdAt) return;
    const date = issue.createdAt.toDate
      ? issue.createdAt.toDate()
      : new Date(issue.createdAt);
    if (!isNaN(date)) trendStats[days[date.getDay()]]++;
  });

  const lineData = days.map(day => ({
    day,
    received: trendStats[day]
  }));

  // ================= LOADING =================
  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh', width: '100%' }}>
      {/* HEADER */}
      <Typography variant="h4" fontWeight={700} mb={4}>
        Analytics Dashboard
      </Typography>

      {/* KPI CARDS */}
      <Grid container spacing={3} mb={4}>
        <KPICard title="Total Reports" value={totalIssues} icon={<TrendingUpIcon />} color="#2563eb" />
        <KPICard title="Pending Issues" value={totalIssues - resolvedCount} icon={<AccessTimeIcon />} color="#f59e0b" />
        <KPICard title="Resolution Rate" value={`${resolutionRate}%`} icon={<CheckCircleOutlineIcon />} color="#16a34a" />
        <KPICard title="High Priority" value={priorityCounts.High} icon={<WarningAmberIcon />} color="#dc2626" />
      </Grid>

      {issues.length === 0 ? (
        <Alert severity="info">No analytics data available.</Alert>
      ) : (
        <Grid container spacing={4}>
          
          {/* WEEKLY TREND */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 420, borderRadius: 3 }}>
              <Typography fontWeight={600} mb={2}>Weekly Trend</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <RechartsTooltip />
                  <Area
                    dataKey="received"
                    stroke="#2563eb"
                    fill="url(#trendFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* PRIORITY PIE – SMALL & FITTED */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 420, borderRadius: 3 }}>
              <Typography fontWeight={600} mb={1.5}>Priority Distribution</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* CATEGORY ANALYSIS */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 420, borderRadius: 3 }}>
              <Typography fontWeight={600} mb={2}>Category Analysis</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}

// ================= KPI CARD =================
function KPICard({ title, value, icon, color }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
          <Typography variant="h4" fontWeight={700} mt={2}>
            {value}
          </Typography>
          <Typography color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
