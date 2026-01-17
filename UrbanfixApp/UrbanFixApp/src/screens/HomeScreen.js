import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Fetch user name
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || 'User');
      }

      // Fetch user's issues
      const issuesQuery = query(
        collection(db, 'issues'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const issuesSnapshot = await getDocs(issuesQuery);
      const issues = issuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate stats
      setStats({
        total: issues.length,
        pending: issues.filter(i => i.status === 'pending').length,
        inProgress: issues.filter(i => i.status === 'in_progress').length,
        resolved: issues.filter(i => i.status === 'resolved').length,
      });

      // Get recent 5 issues
      setRecentIssues(issues.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
          <Text style={styles.subtitle}>Track your civic issues</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="document-text" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Issues</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/report')}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Report New Issue</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Recent Issues */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Issues</Text>
          <TouchableOpacity onPress={() => router.push('/myissues')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentIssues.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No issues reported yet</Text>
            <Text style={styles.emptySubtext}>Tap "Report New Issue" to get started</Text>
          </View>
        ) : (
          recentIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={styles.issueCard}
              onPress={() => router.push(`/issue/${issue.id}`)}
            >
              <View style={styles.issueHeader}>
                <Text style={styles.issueTitle} numberOfLines={1}>
                  {issue.title || issue.category || 'Untitled Issue'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(issue.status)}</Text>
                </View>
              </View>
              <Text style={styles.issueDescription} numberOfLines={2}>
                {issue.description}
              </Text>
              <View style={styles.issueFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {issue.address || 'Location not available'}
                  </Text>
                </View>
                <Text style={styles.issueDate}>
                  {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#2196F3" />
          <Text style={[styles.navText, { color: '#2196F3' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/myissues')}>
          <Ionicons name="list" size={24} color="#666" />
          <Text style={styles.navText}>My Issues</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notificationIcon: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  issueCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  issueDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});