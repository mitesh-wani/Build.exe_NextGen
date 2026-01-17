import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { COLORS, SIZES, SPACING, BORDER_RADIUS, ISSUE_STATUS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // Logic: Fetching issues sorted by newest first
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const issuesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(issuesList);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to map status string to our theme object
  const getStatusInfo = (status) => {
    return ISSUE_STATUS[status?.toUpperCase()] || ISSUE_STATUS.PENDING;
  };

  const renderIssueItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={styles.issueTitle} numberOfLines={1}>{item.title || item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray[500]} />
            <Text style={styles.footerText} numberOfLines={1}>{item.address || 'Location shared'}</Text>
          </View>
          <Text style={styles.footerText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Community Watch</Text>
          <Text style={styles.subGreeting}>Track and report local issues</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={fetchIssues}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={issues}
            renderItem={renderIssueItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={60} color={COLORS.gray[300]} />
                <Text style={styles.emptyText}>No reports found yet.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ReportIssue')}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Primary background for the top safe area
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subGreeting: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.light,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
  },
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    // Shadow
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  issueTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  footerText: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.secondary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.gray[400],
    fontSize: SIZES.md,
  },
});