import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function IssueDetailScreen({ route, navigation }) {
  const { issueId } = route.params;
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssueDetails();
  }, [issueId]);

  const fetchIssueDetails = async () => {
    try {
      const issueDoc = await getDoc(doc(db, 'issues', issueId));
      
      if (issueDoc.exists()) {
        setIssue({ id: issueDoc.id, ...issueDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (issue?.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${issue.location.latitude},${issue.location.longitude}`;
      Linking.openURL(url);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time';
      case 'in_progress': return 'sync';
      case 'resolved': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'in_progress': return 'Being Resolved';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ccc" />
        <Text style={styles.errorText}>Issue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      {issue.imageUrl && (
        <Image source={{ uri: issue.imageUrl }} style={styles.heroImage} />
      )}

      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: getStatusColor(issue.status) }]}>
        <Ionicons name={getStatusIcon(issue.status)} size={32} color="#fff" />
        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getStatusText(issue.status)}</Text>
          <Text style={styles.statusSubtext}>
            Reported on {new Date(issue.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Issue Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{issue.title || issue.category || 'Issue Details'}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
            <Text style={styles.priorityText}>{(issue.priority || 'medium').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.categoryRow}>
          <Ionicons name="pricetag" size={18} color="#666" />
          <Text style={styles.categoryText}>{issue.category}</Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity style={styles.locationCard} onPress={openInMaps}>
          <Ionicons name="location" size={24} color="#2196F3" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationAddress}>{issue.address}</Text>
            {issue.location && (
              <Text style={styles.coordinates}>
                {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
              </Text>
            )}
          </View>
          <Ionicons name="open-outline" size={20} color="#2196F3" />
        </TouchableOpacity>

        {/* Map */}
        {issue.location && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: issue.location.latitude,
                longitude: issue.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: issue.location.latitude,
                  longitude: issue.location.longitude,
                }}
                title="Issue Location"
              />
            </MapView>
          </View>
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Issue Reported</Text>
              <Text style={styles.timelineDate}>
                {new Date(issue.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {issue.assignedAt && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#2196F3' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Assigned to Department</Text>
                <Text style={styles.timelineDate}>
                  {new Date(issue.assignedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {issue.status === 'resolved' && issue.resolvedAt && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Issue Resolved</Text>
                <Text style={styles.timelineDate}>
                  {new Date(issue.resolvedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Resolution Proof (if resolved) */}
        {issue.status === 'resolved' && issue.resolutionImageUrl && (
          <>
            <Text style={styles.sectionTitle}>Resolution Proof</Text>
            <Image 
              source={{ uri: issue.resolutionImageUrl }} 
              style={styles.resolutionImage}
            />
            {issue.resolutionNotes && (
              <Text style={styles.resolutionNotes}>{issue.resolutionNotes}</Text>
            )}
          </>
        )}

        {/* Issue ID */}
        <View style={styles.issueIdCard}>
          <Text style={styles.issueIdLabel}>Issue ID</Text>
          <Text style={styles.issueId}>{issue.id}</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  heroImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  statusHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  detailsContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  resolutionImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 8,
  },
  resolutionNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  issueIdCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  issueIdLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  issueId: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});