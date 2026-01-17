import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebase';
import { subscribeToUserIssues } from '../services/firebaseServices';
import { COLORS, SPACING } from '../constants/theme';

export default function MyIssuesScreen() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsub = subscribeToUserIssues(auth.currentUser?.uid, setIssues);
    return () => unsub();
  }, []);

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status.toLowerCase() === filter.toLowerCase());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <Text style={styles.title}>My Reports</Text>
        
        {/* Horizontal Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Pending', 'In-Progress', 'Resolved'].map(f => (
              <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.chipText, filter === f && { color: 'white' }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Image source={require('../assets/magnifying-glass.png')} style={styles.emptyImg} />
            <Text style={styles.emptyTitle}>No report yet</Text>
            <Text style={styles.emptySub}>Reported civic issues will appear here.</Text>
          </View>
        ) : (
          <FlatList data={filtered} renderItem={({ item }) => <View style={styles.card}>{/* Card Logic */}</View>} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  filterRow: { marginBottom: 20, height: 40 },
  chip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F2F5', marginRight: 10 },
  chipActive: { backgroundColor: COLORS.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyImg: { width: 150, height: 150, resizeMode: 'contain', opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptySub: { color: COLORS.gray[500], marginTop: 5 },
});