import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { subscribeToAllIssues } from '../services/firebaseServices';

export default function HomeScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllIssues((data) => {
      setIssues(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resolved = issues.filter(i => i.status === 'resolved').length;
  const progress = issues.length > 0 ? (resolved / issues.length) * 100 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* UrbanFix Logo Header */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandTitle}>UrbanFix</Text>
        </View>

        {/* City Award Carousel */}
        <View style={styles.carousel}>
          <Image source={require('../assets/city_award.png')} style={styles.carouselImg} />
          <View style={styles.carouselOverlay}><Text style={styles.awardLabel}>Best Managed City 2026</Text></View>
        </View>

        {/* Progress Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>City Achievements</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}><Text style={styles.statNum}>{issues.length}</Text><Text style={styles.statTag}>Reports</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>12</Text><Text style={styles.statTag}>Awards</Text></View>
          </View>

          <View style={styles.progressArea}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Issues Resolved</Text>
              <Text style={styles.progressValue}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBg}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  logo: { width: 35, height: 35, marginRight: 10 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  carousel: { margin: SPACING.md, height: 180, borderRadius: 20, overflow: 'hidden', elevation: 3 },
  carouselImg: { width: '100%', height: '100%' },
  carouselOverlay: { position: 'absolute', bottom: 0, padding: 12, width: '100%', backgroundColor: 'rgba(0,0,0,0.3)' },
  awardLabel: { color: 'white', fontWeight: 'bold' },
  statsSection: { padding: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', gap: 15 },
  statBox: { flex: 1, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  statTag: { fontSize: 12, color: COLORS.gray[500] },
  progressArea: { marginTop: 25 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
});