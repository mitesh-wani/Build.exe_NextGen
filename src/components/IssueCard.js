import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function IssueCard({ issue }) {
  
  // Function to resolve issue directly from the card
  const handleResolve = async () => {
    const proofUrl = prompt("Enter Proof URL for resolution:");
    if (proofUrl) {
      await updateDoc(doc(db, "issues", issue.id), {
        status: "Resolved",
        resolutionProof: proofUrl
      });
    }
  };

  return (
    <Card sx={{ 
      maxWidth: 345, 
      borderRadius: 3, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      {/* Image Section */}
      <CardMedia
        component="img"
        height="180"
        image={issue.imageUrl || "https://via.placeholder.com/300?text=No+Image"}
        alt="Issue Evidence"
        sx={{ objectFit: 'cover' }}
      />

      <CardContent>
        {/* Header: Category & Priority */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={issue.category || "Unclassified"} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={issue.priority || "Normal"} 
            size="small" 
            color={issue.priority === 'High' ? 'error' : 'warning'} 
          />
        </Box>

        {/* Description */}
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {issue.category || "Issue Report"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2, 
          height: 40, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {issue.description}
        </Typography>

        {/* Location & Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            {issue.latitude ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` : "No GPS Data"}
          </Typography>
        </Box>

        {/* Action Button */}
        {issue.status === 'Resolved' ? (
           <Button fullWidth variant="contained" color="success" disabled>
             Resolved
           </Button>
        ) : (
          <Button fullWidth variant="contained" onClick={handleResolve}>
            Mark as Resolved
          </Button>
        )}
      </CardContent>
    </Card>
  );
}