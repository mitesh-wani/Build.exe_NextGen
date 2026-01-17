import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import IssueCard from "../components/IssueCard";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for issues
  useEffect(() => {
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </Box>
  );
}