import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { getIssueById } from '../services/firebaseServices';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function IssueDetailScreen({ route }) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssueById(route.params.issueId).then(res => {
      setIssue(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Image source={{ uri: issue.photos?.[0] }} style={styles.hero} />
      <View style={styles.content}>
        <Text style={styles.title}>{issue.category || 'Civic Issue'}</Text>
        <Text style={styles.desc}>{issue.description}</Text>
        
        {/* AI Analysis */}
        {issue.aiAnalysis && (
          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>🤖 AI Analysis</Text>
            <Text style={styles.aiText}>{issue.aiAnalysis}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, color: '#444', lineHeight: 24 },
  aiBox: { backgroundColor: '#F0F7FF', padding: 15, borderRadius: 12, marginTop: 20 },
  aiTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
});