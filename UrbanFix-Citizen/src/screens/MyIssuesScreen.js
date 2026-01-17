// src/screens/MyIssuesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { 
  getUserIssues, 
  subscribeToUserIssues 
} from '../services/firebaseServices'; // ✅ Use services

import { 
  COLORS, 
  SPACING, 
  BORDER_RADIUS, 
  SIZES, 
  ISSUE_STATUS, 
  PRIORITY_LEVELS, 
  ISSUE_CATEGORIES 
} from '../constants/theme';

const STATUS_FILTERS = [
  { id: 'all', label: 'All', color: COLORS.gray[600] },
  { id: 'pending', label: 'Pending', ...ISSUE_STATUS.PENDING },
  { id: 'in_progress', label: 'In Progress', ...ISSUE_STATUS.IN_PROGRESS },
  { id: 'resolved', label: 'Resolved', ...ISSUE_STATUS.RESOLVED },
];

export default function MyIssuesScreen() {
  const navigation = useNavigation();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchIssues();
      
      // Set up real-time listener
      const userId = auth.currentUser?.uid;
      if (userId) {
        const unsubscribe = subscribeToUserIssues(userId, (updatedIssues) => {
          console.log('✅ Issues updated in real-time:', updatedIssues.length);
          setIssues(updatedIssues);
          setLoading(false);
        });
        
        return () => {
          if (unsubscribe) unsubscribe();
        };
      }
    }, [])
  );

  useEffect(() => {
    filterIssues();
  }, [selectedFilter, issues]);

  const fetchIssues = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Not Logged In', 'Please log in to view your issues');
        setLoading(false);
        return;
      }

      const result = await getUserIssues(userId);
      
      if (result.success) {
        setIssues(result.data);
        console.log(`✅ Fetched ${result.data.length} user issues`);
      } else {
        console.error('❌ Error:', result.error);
        Alert.alert('Error', 'Failed to load your issues');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'Failed to load your issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    if (selectedFilter === 'all') {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(issues.filter(issue => issue.status === selectedFilter));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIssues();
    setRefreshing(false);
  };

  const getCategoryInfo = (categoryName) => {
    const category = ISSUE_CATEGORIES.find(c => c.name === categoryName);
    return category || { icon: 'help-circle-outline', color: COLORS.gray[500] };
  };

  const formatDate = (date) => {
    if (!date) return '—';
    
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderIssueCard = ({ item }) => {
    const statusInfo = ISSUE_STATUS[item.status?.toUpperCase()] || ISSUE_STATUS.PENDING;
    const priorityInfo = PRIORITY_LEVELS[item.priority?.toUpperCase()] || PRIORITY_LEVELS.MEDIUM;
    const categoryInfo = getCategoryInfo(item.category);

    // ✅ Get image from photos array
    const imageUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

    return (
      <TouchableOpacity
        style={styles.issueCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
      >
        {/* Image or Category Icon */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.issueImage} />
        ) : (
          <View style={[styles.categoryIconContainer, { backgroundColor: categoryInfo.color + '15' }]}>
            <View style={[styles.categoryIconCircle, { backgroundColor: categoryInfo.color + '25' }]}>
              <Ionicons name={categoryInfo.icon} size={32} color={categoryInfo.color} />
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag" size={12} color={COLORS.primary} />
              <Text style={styles.categoryText}>{item.category || 'General'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.title || item.category || 'Untitled Issue'}
          </Text>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.location} numberOfLines={1}>
                {item.location?.address || 'Location'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.priorityDot, { backgroundColor: priorityInfo.color }]} />
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
          <Ionicons name="hourglass" size={20} color={COLORS.warning} />
        </View>
        <Text style={styles.statNumber}>
          {issues.filter(i => i.status === 'pending').length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: COLORS.info + '15' }]}>
          <Ionicons name="construct" size={20} color={COLORS.info} />
        </View>
        <Text style={styles.statNumber}>
          {issues.filter(i => i.status === 'in_progress').length}
        </Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        </View>
        <Text style={styles.statNumber}>
          {issues.filter(i => i.status === 'resolved').length}
        </Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.titleLarge}>My Reports</Text>
            <Text style={styles.subtitle}>
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'} reported
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('ReportIssue')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {!loading && issues.length > 0 && renderStats()}

        {/* Filters */}
        <View style={styles.filters}>
          {STATUS_FILTERS.map(filter => {
            const isActive = selectedFilter === filter.id;
            const count = filter.id === 'all' 
              ? issues.length 
              : issues.filter(i => i.status === filter.id).length;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  isActive && { 
                    backgroundColor: filter.color || filter.bgColor || COLORS.primary,
                    borderColor: filter.color || filter.bgColor || COLORS.primary,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterLabel, isActive && { color: COLORS.white }]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterBadge, 
                  isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }
                ]}>
                  <Text style={[styles.filterBadgeText, isActive && { color: COLORS.white }]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your reports...</Text>
          </View>
        ) : filteredIssues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons 
                name={selectedFilter === 'all' ? 'document-text-outline' : 'funnel-outline'} 
                size={48} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No Reports Yet' : `No ${selectedFilter.replace('_', ' ')} issues`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all'
                ? 'Start reporting civic issues in your community'
                : 'Try selecting a different filter'}
            </Text>

            {selectedFilter === 'all' && (
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => navigation.navigate('ReportIssue')}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={22} color={COLORS.white} />
                <Text style={styles.reportBtnText}>Report an Issue</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredIssues}
            renderItem={renderIssueCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },

  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '600',
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray[700],
  },
  filterBadge: {
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.gray[700],
  },

  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  issueCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  issueImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.gray[200],
  },
  categoryIconContainer: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  categoryText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
    marginRight: SPACING.sm,
  },
  location: {
    fontSize: SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    fontWeight: '500',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reportBtnText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});