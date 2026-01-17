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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { 
  COLORS, 
  SIZES, 
  SPACING, 
  BORDER_RADIUS, 
  ISSUE_STATUS, 
  PRIORITY_LEVELS 
} from '../constants/theme';

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
      const { latitude, longitude } = issue.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Get status and priority details from theme constants
  const currentStatus = ISSUE_STATUS[issue?.status?.toUpperCase()] || ISSUE_STATUS.PENDING;
  const currentPriority = PRIORITY_LEVELS[issue?.priority?.toUpperCase()] || PRIORITY_LEVELS.MEDIUM;

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        {issue?.imageUrl ? (
          <Image source={{ uri: issue.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={50} color={COLORS.gray[400]} />
          </View>
        )}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: currentStatus.color }]}>
        <Text style={styles.statusLabel}>STATUS: {currentStatus.label.toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        {/* Title and Priority */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{issue?.title || issue?.category}</Text>
          <View style={[styles.priorityBadge, { borderColor: currentPriority.color }]}>
            <Text style={[styles.priorityText, { color: currentPriority.color }]}>
              {currentPriority.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray[500]} />
          <Text style={styles.metaText}>Reported {new Date(issue?.createdAt).toLocaleDateString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue?.description}</Text>

        {/* Location Section */}
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity style={styles.locationCard} onPress={openInMaps}>
          <View style={styles.locationIconCircle}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressText} numberOfLines={2}>{issue?.address}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        {issue?.location && (
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: issue.location.latitude,
                longitude: issue.location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
            >
              <Marker coordinate={issue.location} pinColor={currentStatus.color} />
            </MapView>
          </View>
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timelineCard}>
          <TimelineItem 
            title="Issue Reported" 
            date={issue?.createdAt} 
            isLast={!issue?.assignedAt} 
            completed 
          />
          {issue?.assignedAt && (
            <TimelineItem 
              title="Assigned to Team" 
              date={issue.assignedAt} 
              isLast={issue.status !== 'resolved'} 
              completed 
            />
          )}
          {issue?.status === 'resolved' && (
            <TimelineItem 
              title="Resolved" 
              date={issue.resolvedAt} 
              isLast={true} 
              completed 
              color={COLORS.success}
            />
          )}
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Helper Component for Timeline
const TimelineItem = ({ title, date, isLast, completed, color = COLORS.primary }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.dot, { backgroundColor: completed ? color : COLORS.gray[300] }]} />
      {!isLast && <View style={styles.line} />}
    </View>
    <View style={styles.timelineRight}>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDate}>{new Date(date).toLocaleString()}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 250 },
  heroImage: { width: '100%', height: '100%' },
  placeholderImage: { backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBanner: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  statusLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.sm,
    letterSpacing: 1,
  },
  content: { padding: SPACING.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
  },
  priorityBadge: {
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  metaText: { color: COLORS.gray[500], fontSize: SIZES.sm, marginLeft: 6 },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  locationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addressText: { fontSize: SIZES.md, color: COLORS.dark },
  mapWrapper: {
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  map: { ...StyleSheet.absoluteFillObject },
  timelineCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  timelineItem: { flexDirection: 'row', height: 60 },
  timelineLeft: { alignItems: 'center', marginRight: SPACING.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, backgroundColor: COLORS.gray[200] },
  timelineTitle: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.dark },
  timelineDate: { fontSize: SIZES.sm, color: COLORS.gray[500] },
  footerIcon: {
    color: COLORS.gray[400],
  },
}); 