import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const STATUS_FILTERS = [
  { id: 'all', label: 'All', color: '#666' },
  { id: 'pending', label: 'Pending', color: '#FF9800' },
  { id: 'in_progress', label: 'In Progress', color: '#2196F3' },
  { id: 'resolved', label: 'Resolved', color: '#4CAF50' },
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderIssueCard = ({ item }) => (
    <TouchableOpacity
      style={styles.issueCard}
      onPress={() => router.push(`/issue/${item.id}`)}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
      )}
      
      <View style={styles.issueContent}>
        <View style={styles.issueHeader}>
          <Text style={styles.issueTitle} numberOfLines={1}>
            {item.title || item.category || 'Untitled Issue'}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{(item.priority || 'medium').toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.issueFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.address || 'Location not available'}
            </Text>
          </View>
        </View>

        <View style={styles.issueMetadata}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.issueDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#ccc" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Issues</Text>
          <Text style={styles.headerSubtitle}>
            {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
          </Text>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && { backgroundColor: filter.color },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
            {filter.id !== 'all' && (
              <View
                style={[
                  styles.filterCount,
                  selectedFilter === filter.id && styles.filterCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    selectedFilter === filter.id && styles.filterCountTextActive,
                  ]}
                >
                  {issues.filter(i => i.status === filter.id).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Issues List */}
      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : filteredIssues.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {selectedFilter === 'all'
              ? 'No issues reported yet'
              : `No ${selectedFilter.replace('_', ' ')} issues`}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedFilter === 'all'
              ? 'Tap below to report your first issue'
              : 'Try selecting a different filter'}
          </Text>
          {selectedFilter === 'all' && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => router.push('/report')}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          renderItem={renderIssueCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterCount: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterCountTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  issueImage: {
    width: 100,
    height: '100%',
    minHeight: 140,
  },
  issueContent: {
    flex: 1,
    padding: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  issueFooter: {
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  issueMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  issueDate: {
    fontSize: 12,
    color: '#999',
  },
  chevron: {
    alignSelf: 'center',
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
  reportButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});