import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase'; // ✅ Updated import
import { 
  getAllIssues, 
  subscribeToAllIssues, // ✅ Real-time listener
  getUserNotifications 
} from '../services/firebaseServices'; // ✅ Import services
import { COLORS, SIZES, SPACING, BORDER_RADIUS, ISSUE_STATUS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unsubscribe, setUnsubscribe] = useState(null); // ✅ Store unsubscribe function

  useEffect(() => {
    fetchIssues();
    fetchNotificationCount();
    
    // ✅ Set up real-time listener for issues
    const unsubscribeIssues = subscribeToAllIssues((updatedIssues) => {
      console.log('✅ Real-time update:', updatedIssues.length, 'issues');
      setIssues(updatedIssues);
      setLoading(false);
    });

    setUnsubscribe(() => unsubscribeIssues);

    // ✅ Cleanup listener on unmount
    return () => {
      if (unsubscribeIssues) {
        unsubscribeIssues();
      }
    };
  }, []);

  const fetchIssues = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      // ✅ Use service function instead of direct Firestore query
      const result = await getAllIssues();
      
      if (result.success) {
        console.log(`✅ Fetched ${result.data.length} issues`);
        setIssues(result.data);
      } else {
        console.error('❌ Error fetching issues:', result.error);
        Alert.alert('Error', 'Failed to load issues');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const result = await getUserNotifications(user.uid);
      if (result.success) {
        const unread = result.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const onRefresh = () => {
    fetchIssues(true);
    fetchNotificationCount();
  };

  const getStatusInfo = (status) => {
    return ISSUE_STATUS[status?.toUpperCase()] || ISSUE_STATUS.PENDING;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: COLORS.success,
      medium: COLORS.warning,
      high: COLORS.danger,
      critical: COLORS.danger,
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recent';
    
    // ✅ Handle both JS Date and Firestore Timestamp
    const date = timestamp instanceof Date ? timestamp : 
                 timestamp?.toDate ? timestamp.toDate() : 
                 new Date(timestamp);
    
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderIssueItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const priorityColor = getPriorityColor(item.priority);

    // ✅ Handle photos array (service returns 'photos' array, not 'imageUrl')
    const imageUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
        activeOpacity={0.7}
      >
        {/* Image Preview */}
        {imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryContainer}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={styles.categoryText}>
                {item.category || 'General'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.issueTitle} numberOfLines={2}>
            {item.title || item.description}
          </Text>
          
          {item.description && item.title && (
            <Text style={styles.issueDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.footerText} numberOfLines={1}>
                {/* ✅ Use location.address from service structure */}
                {item.location?.address || 'Location shared'}
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray[400]} />
              <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
        <Text style={styles.statNumber}>{issues.length}</Text>
        <Text style={styles.statLabel}>Total Reports</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        <Text style={styles.statNumber}>
          {issues.filter(i => i.status === 'resolved').length}
        </Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="hourglass" size={24} color={COLORS.primary} />
        <Text style={styles.statNumber}>
          {issues.filter(i => i.status === 'pending').length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Community Watch</Text>
          <Text style={styles.subGreeting}>Track and report local issues</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          {/* ✅ Dynamic notification badge */}
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity 
            onPress={onRefresh} 
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : (
          <FlatList
            data={issues}
            renderItem={renderIssueItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="documents-outline" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Reports Yet</Text>
                <Text style={styles.emptyText}>
                  Be the first to report an issue in your community
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('ReportIssue')}
                >
                  <Text style={styles.emptyButtonText}>Report an Issue</Text>
                </TouchableOpacity>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ReportIssue')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subGreeting: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray[200],
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  issueTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  issueDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
    gap: 4,
  },
  footerText: {
    fontSize: SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl + 20,
    right: SPACING.lg,
    backgroundColor: COLORS.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});