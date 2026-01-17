import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { COLORS } from '../constants/theme';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'users', auth.currentUser.uid)).then(d => setProfile(d.data()));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile?.displayName?.[0] || 'U'}</Text>
      </View>
      <Text style={styles.name}>{profile?.displayName || 'User'}</Text>
      <Text style={styles.email}>{auth.currentUser.email}</Text>

      <TouchableOpacity style={styles.logout} onPress={() => signOut(auth)}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', paddingTop: 80 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  email: { color: '#666', marginTop: 5 },
  logout: { marginTop: 50, backgroundColor: COLORS.danger, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
});