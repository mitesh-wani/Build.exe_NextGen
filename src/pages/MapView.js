import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Box, Typography, CircularProgress, Card, CardMedia, CardContent, 
  Chip, Alert, Stack, Divider, FormControl, Select, MenuItem, InputLabel 
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon,
  Description as DescIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// --- CONFIGURATION ---
const containerStyle = {
  width: '100%',
  height: '75vh', // Slightly reduced to fit filters
  borderRadius: '15px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

export default function MapView({ issuesProp }) {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [debugMsg, setDebugMsg] = useState("");
  
  // --- FILTER STATE ---
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // REPLACE WITH YOUR ACTUAL KEY
    googleMapsApiKey: "AIzaSyDUtKOFnOnkgo-W0jBu9WK93_kKXRqM8QA" 
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    const processData = (rawData) => {
      // Validate GPS data structure
      const validIssues = rawData.filter(i => {
        const hasLocationObj = i.location && typeof i.location === 'object';
        if (!hasLocationObj) return false;
        return i.location.lat !== undefined && i.location.lng !== undefined;
      });

      if (rawData.length > 0 && validIssues.length === 0) {
        setDebugMsg(`Found issues, but none have valid location data.`);
      } else {
        setDebugMsg("");
      }
      setIssues(validIssues);

      // Auto-center map on first valid issue
      if (validIssues.length > 0 && mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        validIssues.forEach(issue => {
          bounds.extend({ lat: parseFloat(issue.location.lat), lng: parseFloat(issue.location.lng) });
        });
        mapRef.current.fitBounds(bounds);
      } else if (validIssues.length > 0) {
         setMapCenter({
           lat: parseFloat(validIssues[0].location.lat),
           lng: parseFloat(validIssues[0].location.lng)
         });
      }
    };

    if (issuesProp && issuesProp.length > 0) {
      processData(issuesProp);
    } else {
      const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {
        const firebaseIssues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processData(firebaseIssues);
      });
      return () => unsubscribe();
    }
  }, [issuesProp]);

  // --- FILTERING LOGIC ---
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchStatus = statusFilter === 'All' || (issue.status || 'Pending') === statusFilter;
      const matchCategory = categoryFilter === 'All' || (issue.category || 'Other') === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [issues, statusFilter, categoryFilter]);

  // Get unique categories for the dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Set(issues.map(i => i.category || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [issues]);

  // --- FORMATTING HELPERS ---
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      
      {/* HEADER & FILTERS */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon /> Live Issue Map
        </Typography>

        {/* FILTER CONTROLS */}
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {uniqueCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Stack>
      </Stack>

      {debugMsg && <Alert severity="warning" sx={{ mb: 2 }}>{debugMsg}</Alert>}

      {/* MAP CONTAINER */}
      <Box sx={{ position: 'relative', height: '75vh', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={10}
          options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false }}
          onLoad={map => mapRef.current = map}
        >
          {/* Render Filtered Markers */}
          {filteredIssues.map((issue) => (
            <Marker
              key={issue.id}
              position={{
                lat: parseFloat(issue.location.lat),
                lng: parseFloat(issue.location.lng)
              }}
              onClick={() => setSelectedIssue(issue)}
              // Optional: Change marker color based on status
              icon={issue.status === 'Resolved' ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
            />
          ))}

          {/* INFO WINDOW POPUP (Updated to match IssueCard design) */}
          {selectedIssue && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedIssue.location.lat),
                lng: parseFloat(selectedIssue.location.lng)
              }}
              onCloseClick={() => setSelectedIssue(null)}
            >
              <Card sx={{ maxWidth: 320, boxShadow: 'none', border: 'none' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={selectedIssue.imageUrl || (selectedIssue.photos && selectedIssue.photos[0]) || "https://placehold.co/150"}
                  alt="Issue"
                  sx={{ borderRadius: 1, objectFit: 'cover', mb: 1 }}
                />

                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight="800" fontSize="1rem">
                        {selectedIssue.category || "General Issue"}
                      </Typography>
                      <Chip
                        label={selectedIssue.status || 'Pending'}
                        color={selectedIssue.status === 'Resolved' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20, fontWeight: 'bold' }}
                      />
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {/* Location */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 18, color: '#757575', mt: 0.3 }} />
                          <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">LOCATION</Typography>
                              <Typography variant="body2" lineHeight={1.2}>
                                  {selectedIssue.location.address || "GPS Coordinates Only"}
                              </Typography>
                          </Box>
                      </Box>

                      {/* Date */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                          <TimeIcon sx={{ fontSize: 18, color: '#757575', mt: 0.3 }} />
                          <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">REPORTED ON</Typography>
                              <Typography variant="body2">
                                  {formatDate(selectedIssue.createdAt)}
                              </Typography>
                          </Box>
                      </Box>

                      {/* Description */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                          <DescIcon sx={{ fontSize: 18, color: '#757575', mt: 0.3 }} />
                          <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">DESCRIPTION</Typography>
                              <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mt: 0.5 }}>
                                  {selectedIssue.description || "No description provided."}
                              </Typography>
                          </Box>
                      </Box>

                      {/* Priority Badge */}
                      {selectedIssue.priority && (
                          <Box sx={{ mt: 0.5 }}>
                               <Chip
                                  label={`Priority: ${selectedIssue.priority}`}
                                  color={selectedIssue.priority === 'High' ? 'error' : 'default'}
                                  variant="outlined"
                                  size="small"
                                  sx={{ fontSize: '0.7rem', width: '100%' }}
                                />
                          </Box>
                      )}
                  </Box>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
        </GoogleMap>
      </Box>
    </Box>
  );
}