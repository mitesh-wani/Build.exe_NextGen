import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Description as DescIcon
} from '@mui/icons-material';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function IssueCard({ issue }) {
  // ✅ HOOKS MUST BE FIRST
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ SAFETY CHECK AFTER HOOKS
  if (!issue) return null;

  // IMAGE LOGIC
  const imageSrc =
    issue.imageUrl ||
    (issue.photos && issue.photos[0]) ||
    'https://placehold.co/600x400';

  // DATE FORMATTER
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // OPEN CONFIRMATION
  const handleResolveClick = () => {
    setOpen(true);
  };

  // CLOSE CONFIRMATION
  const handleClose = () => {
    setOpen(false);
  };

  // CONFIRM RESOLVE
  const confirmResolve = async () => {
    if (!issue.id) {
      console.error('Issue ID missing');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'issues', issue.id), {
        status: 'Resolved',
        resolvedAt: new Date()
      });
      setOpen(false);
    } catch (error) {
      console.error('Error resolving issue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <CardMedia
          component="img"
          height="180"
          image={imageSrc}
          alt={issue.category || 'Issue Image'}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={800} fontSize="1.1rem">
                {issue.category || 'General Issue'}
              </Typography>

              <Chip
                label={issue.status || 'Pending'}
                color={issue.status === 'Resolved' ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 20, color: '#757575', mt: 0.3 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    LOCATION
                  </Typography>
                  <Typography variant="body2">
                    {issue.location?.address || 'No GPS Data available'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TimeIcon sx={{ fontSize: 20, color: '#757575', mt: 0.3 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    REPORTED ON
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(issue.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <DescIcon sx={{ fontSize: 20, color: '#757575', mt: 0.3 }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    DESCRIPTION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mt: 0.5 }}
                  >
                    {issue.description || 'No description provided.'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 'auto', pt: 3 }}>
            {issue.status === 'Resolved' ? (
              <Button fullWidth variant="contained" disabled sx={{ bgcolor: '#e0e0e0' }}>
                Resolved
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleResolveClick}
              >
                Mark as Resolved
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Resolution</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this issue as <b>Resolved</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={confirmResolve}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? 'Resolving...' : 'Yes, Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
