// FILE: src/pages/Issues.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Ensure this path is correct for your project
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import IssueCard from "../components/IssueCard"; // Importing the card component
import { Box, Typography, CircularProgress, Alert, Grid } from "@mui/material";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query issues sorted by newest first
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e293b' }}>
        All Reported Issues ({issues.length})
      </Typography>

      {issues.length === 0 ? (
        <Alert severity="info">No issues have been reported yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} sm={6} md={4} key={issue.id}>
              <IssueCard issue={issue} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}