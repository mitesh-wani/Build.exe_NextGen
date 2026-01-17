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
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { 
  getIssueById,
  subscribeToIssue, // ✅ Real-time updates
} from '../services/firebaseServices'; // ✅ Import services
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

    // ✅ Set up real-time listener for this specific issue
    const unsubscribe = subscribeToIssue(issueId, (updatedIssue) => {
      console.log('✅ Issue updated in real-time:', updatedIssue.id);
      setIssue(updatedIssue);
      setLoading(false);
    });

    // ✅ Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [issueId]);

  const fetchIssueDetails = async () => {
    try {
      // ✅ Use service function
      const result = await getIssueById(issueId);
      
      if (result.success) {
        console.log('✅ Issue fetched:', result.data.id);
        setIssue(result.data);
      } else {
        console.error('❌ Issue not found:', result.error);
        Alert.alert('Error', 'Issue not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Error fetching issue:', error);
      Alert.alert('Error', 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (issue?.location) {
      // ✅ Service returns location with lat/lng, not latitude/longitude
      const { lat, lng } = issue.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this community issue: ${issue?.title || issue?.category}\n\nLocation: ${issue?.location?.address || 'Location shared'}\n\nDescription: ${issue?.description}`,
        title: 'Share Issue',
      });
    } catch (error) {
      console.error('❌ Share error:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // ✅ Service already converts to JS Date
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    // ✅ Service already converts to JS Date
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.gray[300]} />
        <Text style={styles.errorText}>Issue not found</Text>
      </View>
    );
  }

  const currentStatus = ISSUE_STATUS[issue?.status?.toUpperCase()] || ISSUE_STATUS.PENDING;
  const currentPriority = PRIORITY_LEVELS[issue?.priority?.toUpperCase()] || PRIORITY_LEVELS.MEDIUM;

  // ✅ Service returns 'photos' array, not 'imageUrl'
  const imageUrl = issue?.photos && issue.photos.length > 0 ? issue.photos[0] : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={64} color={COLORS.gray[400]} />
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          )}
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Status Badge Overlay */}
          <View style={styles.statusOverlay}>
            <View style={[styles.statusPill, { backgroundColor: currentStatus.color }]}>
              <Ionicons name="information-circle" size={16} color={COLORS.white} />
              <Text style={styles.statusPillText}>{currentStatus.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Ionicons name="folder-outline" size={14} color={COLORS.primary} />
                <Text style={styles.categoryText}>{issue?.category || 'General'}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: currentPriority.color }]}>
                <Ionicons name="flag" size={12} color={COLORS.white} />
                <Text style={styles.priorityText}>{currentPriority.label}</Text>
              </View>
            </View>

            <Text style={styles.title}>{issue?.title || issue?.category}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.gray[500]} />
                <Text style={styles.metaText}>Reported {formatDate(issue?.createdAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={16} color={COLORS.gray[500]} />
                <Text style={styles.metaText}>ID: {issue?.id.slice(0, 8)}</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{issue?.description}</Text>
          </View>

          {/* Reporter Info Card - NEW */}
          {issue?.userName && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Reported By</Text>
              </View>
              <View style={styles.reporterInfo}>
                <Text style={styles.reporterName}>{issue.userName}</Text>
                {issue.userPhone && (
                  <Text style={styles.reporterPhone}>{issue.userPhone}</Text>
                )}
              </View>
            </View>
          )}

          {/* Assigned Officer Info - NEW */}
          {issue?.assignedOfficerName && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="people" size={20} color={COLORS.warning} />
                <Text style={styles.cardTitle}>Assigned To</Text>
              </View>
              <View style={styles.reporterInfo}>
                <Text style={styles.reporterName}>{issue.assignedOfficerName}</Text>
                <Text style={styles.reporterPhone}>Handling this issue</Text>
              </View>
            </View>
          )}

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            
            <TouchableOpacity style={styles.locationCard} onPress={openInMaps} activeOpacity={0.7}>
              <View style={styles.locationIconCircle}>
                <Ionicons name="navigate" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                {/* ✅ Use location.address from service structure */}
                <Text style={styles.addressText} numberOfLines={2}>
                  {issue?.location?.address || 'Location shared'}
                </Text>
                {issue?.location && (
                  <Text style={styles.coordsText}>
                    {/* ✅ Use lat/lng from service structure */}
                    {issue.location.lat.toFixed(5)}, {issue.location.lng.toFixed(5)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            {issue?.location && (
              <View style={styles.mapWrapper}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    // ✅ Use lat/lng from service structure
                    latitude: issue.location.lat,
                    longitude: issue.location.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker 
                    coordinate={{
                      // ✅ Map expects latitude/longitude
                      latitude: issue.location.lat,
                      longitude: issue.location.lng,
                    }}
                    pinColor={currentStatus.color}
                  >
                    <View style={[styles.customMarker, { backgroundColor: currentStatus.color }]}>
                      <Ionicons name="location-sharp" size={24} color={COLORS.white} />
                    </View>
                  </Marker>
                </MapView>
                <TouchableOpacity style={styles.mapOverlay} onPress={openInMaps}>
                  <Text style={styles.mapOverlayText}>Tap to open in Maps</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* AI Analysis Card - NEW */}
          {issue?.aiAnalysis && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={20} color={COLORS.secondary} />
                <Text style={styles.cardTitle}>AI Analysis</Text>
              </View>
              <Text style={styles.description}>{issue.aiAnalysis}</Text>
            </View>
          )}

          {/* Resolution Proof Card - NEW */}
          {issue?.resolutionProof && issue.resolutionProof.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-done" size={20} color={COLORS.success} />
                <Text style={styles.cardTitle}>Resolution Proof</Text>
              </View>
              {issue.resolutionNote && (
                <Text style={styles.description}>{issue.resolutionNote}</Text>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofImages}>
                {issue.resolutionProof.map((url, index) => (
                  <Image 
                    key={index} 
                    source={{ uri: url }} 
                    style={styles.proofImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Timeline Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Status Timeline</Text>
            </View>
            
            <View style={styles.timeline}>
              <TimelineItem 
                icon="add-circle"
                title="Issue Reported" 
                date={issue?.createdAt}
                dateFormatter={formatDateTime}
                isLast={!issue?.assignedTo && issue?.status === 'pending'} 
                completed 
                color={COLORS.primary}
              />
              {issue?.assignedTo && (
                <TimelineItem 
                  icon="people"
                  title="Assigned to Team" 
                  subtitle={issue.assignedOfficerName}
                  date={issue.updatedAt}
                  dateFormatter={formatDateTime}
                  isLast={issue.status === 'assigned'} 
                  completed 
                  color={COLORS.warning}
                />
              )}
              {issue?.status === 'in-progress' && (
                <TimelineItem 
                  icon="hammer"
                  title="Work in Progress" 
                  date={issue.updatedAt}
                  dateFormatter={formatDateTime}
                  isLast={true} 
                  completed 
                  color={COLORS.info}
                />
              )}
              {issue?.status === 'resolved' && (
                <TimelineItem 
                  icon="checkmark-circle"
                  title="Resolved" 
                  date={issue.resolvedAt}
                  dateFormatter={formatDateTime}
                  isLast={true} 
                  completed 
                  color={COLORS.success}
                />
              )}
              {issue?.status === 'pending' && !issue?.assignedTo && (
                <TimelineItem 
                  icon="hourglass-outline"
                  title="Awaiting Review" 
                  date={null}
                  dateFormatter={formatDateTime}
                  isLast={true} 
                  completed={false}
                  color={COLORS.gray[300]}
                />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={openInMaps}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>View on Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced Timeline Component
const TimelineItem = ({ icon, title, subtitle, date, dateFormatter, isLast, completed, color }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.dot, { 
        backgroundColor: completed ? color : COLORS.gray[200],
        borderWidth: completed ? 0 : 2,
        borderColor: COLORS.gray[300]
      }]}>
        {completed && <Ionicons name={icon} size={14} color={COLORS.white} />}
      </View>
      {!isLast && <View style={[styles.line, { 
        backgroundColor: completed ? color + '30' : COLORS.gray[200] 
      }]} />}
    </View>
    <View style={styles.timelineRight}>
      <Text style={[styles.timelineTitle, !completed && { color: COLORS.gray[400] }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      )}
      {date && (
        <Text style={styles.timelineDate}>{dateFormatter(date)}</Text>
      )}
      {!date && completed && (
        <Text style={styles.timelineDate}>Pending...</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: { 
    flex: 1, 
    backgroundColor: COLORS.gray[50] 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.gray[500],
    fontSize: SIZES.lg,
  },
  imageContainer: { 
    width: '100%', 
    height: 300,
    position: 'relative',
  },
  heroImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: { 
    backgroundColor: COLORS.gray[200], 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
  },
  headerActions: {
    position: 'absolute',
    top: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusPillText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: { 
    padding: SPACING.lg,
    backgroundColor: COLORS.gray[50],
  },
  headerSection: {
    marginBottom: SPACING.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  categoryText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  priorityText: { 
    fontSize: SIZES.xs, 
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  metaRow: { 
    flexDirection: 'row',
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: { 
    color: COLORS.gray[600], 
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.gray[700],
    lineHeight: 24,
  },
  reporterInfo: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  reporterName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  reporterPhone: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
  },
  proofImages: {
    marginTop: SPACING.md,
  },
  proofImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  locationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addressText: { 
    fontSize: SIZES.md, 
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    fontFamily: 'monospace',
  },
  mapWrapper: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeline: {
    paddingLeft: SPACING.xs,
  },
  timelineItem: { 
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLeft: { 
    alignItems: 'center', 
    marginRight: SPACING.md,
    width: 24,
  },
  dot: { 
    width: 24, 
    height: 24, 
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  line: { 
    width: 2, 
    flex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineTitle: { 
    fontSize: SIZES.md, 
    fontWeight: '700', 
    color: COLORS.dark,
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  timelineDate: { 
    fontSize: SIZES.sm, 
    color: COLORS.gray[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});