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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

// Import your theme constants
import { COLORS, SPACING, BORDER_RADIUS, SIZES, ISSUE_STATUS, PRIORITY_LEVELS, ISSUE_CATEGORIES } from '../constants/theme';

const STATUS_FILTERS = [
  { id: 'all', label: 'All', color: COLORS.gray[600] },
  { id: 'pending', label: 'Pending', ...ISSUE_STATUS.PENDING },
  { id: 'in_progress', label: 'In Progress', ...ISSUE_STATUS.IN_PROGRESS },
  { id: 'resolved', label: 'Resolved', ...ISSUE_STATUS.RESOLVED },
  // You can add 'rejected' if needed
];

export default function MyIssuesScreen() {
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [selectedFilter, issues]);

  const fetchIssues = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const issuesQuery = query(
        collection(db, 'issues'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(issuesQuery);
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure createdAt is handled properly (Firestore Timestamp → Date)
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toDate() 
          : new Date(doc.data().createdAt),
      }));

      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching issues:', error);
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

  // Helper to get category icon & color
  const getCategoryInfo = (categoryName) => {
    const category = ISSUE_CATEGORIES.find(c => c.name === categoryName);
    return category || { icon: 'help-circle-outline', color: COLORS.gray[500] };
  };

  const renderIssueCard = ({ item }) => {
    const statusInfo = ISSUE_STATUS[item.status?.toUpperCase()] || ISSUE_STATUS.PENDING;
    const priorityInfo = PRIORITY_LEVELS[item.priority?.toUpperCase()] || PRIORITY_LEVELS.MEDIUM;
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <TouchableOpacity
        style={styles.issueCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/issue/${item.id}`)}
      >
        <View style={styles.cardContent}>
          {/* Left side - Image or Category Icon */}
          <View style={styles.leftColumn}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
            ) : (
              <View style={[styles.categoryIconContainer, { backgroundColor: categoryInfo.color + '22' }]}>
                <Ionicons name={categoryInfo.icon} size={36} color={categoryInfo.color} />
              </View>
            )}
          </View>

          {/* Main content */}
          <View style={styles.mainContent}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title || item.category || 'Untitled Issue'}
              </Text>

              <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color }]}>
                <Text style={styles.priorityText}>{priorityInfo.label}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description || 'No description provided'}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={SIZES.sm} color={COLORS.gray[500]} />
              <Text style={styles.location} numberOfLines={1}>
                {item.address || 'Location not specified'}
              </Text>
            </View>

            <View style={styles.footerRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>

              <Text style={styles.date}>
                {item.createdAt ? item.createdAt.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : '—'}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.dark} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.titleLarge}>My Issues</Text>
          <Text style={styles.subtitle}>
            {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map(filter => {
          const isActive = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: filter.color || filter.bgColor || COLORS.primary },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && { color: COLORS.white },
                ]}
              >
                {filter.label}
              </Text>

              {filter.id !== 'all' && (
                <View style={[styles.filterBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.35)' }]}>
                  <Text style={[styles.filterBadgeText, isActive && { color: COLORS.white }]}>
                    {issues.filter(i => i.status === filter.id).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredIssues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={80} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>
            {selectedFilter === 'all' ? 'No issues yet' : `No ${selectedFilter.replace('_', ' ')} issues`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'all'
              ? 'Report your first civic issue'
              : 'Try another filter'}
          </Text>

          {selectedFilter === 'all' && (
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => router.push('/report')}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.reportBtnText}>Report Issue</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          renderItem={renderIssueCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  titleLarge: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    marginTop: 2,
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 22,
    height: 22,
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
  },

  issueCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftColumn: {
    width: 100,
    backgroundColor: COLORS.gray[50],
  },
  issueImage: {
    width: '100%',
    height: '100%',
    minHeight: 140,
  },
  categoryIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 140,
  },
  mainContent: {
    flex: 1,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: COLORS.white,
    fontSize: SIZES.sm - 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: SIZES.sm - 1,
    fontWeight: '600',
  },
  date: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  reportBtnText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
});