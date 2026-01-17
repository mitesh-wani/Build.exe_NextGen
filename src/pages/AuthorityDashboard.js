import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { 
  Container, Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, Button, Chip, Typography, Box, Link 
} from '@mui/material';

function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);

  // Live Sync with Firestore
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Mark as Resolved
  const resolveIssue = async (id) => {
    const proofUrl = prompt("Enter Proof URL (or leave empty for demo):", "http://via.placeholder.com/150");
    if (proofUrl) {
      await updateDoc(doc(db, "issues", id), {
        status: "Resolved",
        resolutionProof: proofUrl
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        🏛️ Authority Dashboard
      </Typography>
      
      <Paper elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#eee' }}>
            <TableRow>
              <TableCell><strong>Evidence</strong></TableCell>
              <TableCell><strong>Category (AI)</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                {/* Photo Evidence */}
                <TableCell>
                  {issue.imageUrl ? (
                    <Link href={issue.imageUrl} target="_blank">
                      <img src={issue.imageUrl} alt="proof" width="60" style={{borderRadius: 5}}/>
                    </Link>
                  ) : "No Img"}
                </TableCell>
                
                {/* AI Category */}
                <TableCell>{issue.category}</TableCell>
                
                {/* Description */}
                <TableCell>{issue.description}</TableCell>
                
                {/* Priority Chip */}
                <TableCell>
                  <Chip 
                    label={issue.priority} 
                    color={issue.priority === 'High' ? 'error' : 'default'} 
                    size="small"
                  />
                </TableCell>
                
                {/* Status Chip */}
                <TableCell>
                  <Chip 
                    label={issue.status} 
                    color={issue.status === 'Resolved' ? 'success' : 'warning'} 
                    variant="outlined"
                  />
                </TableCell>
                
                {/* Action Button */}
                <TableCell>
                  {issue.status !== 'Resolved' && (
                    <Button 
                      size="small" 
                      variant="contained" 
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
    </Container>
  );
}

export default AuthorityDashboard;