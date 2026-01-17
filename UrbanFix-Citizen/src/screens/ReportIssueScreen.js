import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { createIssue } from '../services/firebaseServices';
import { auth } from '../services/firebase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ReportIssueScreen({ navigation }) {
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    let res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!res.canceled) setImg(res.assets[0].uri);
  };

  const handleSend = async () => {
    if (!desc || !img) return Alert.alert('Required', 'Photo and description needed');
    setLoading(true);
    const res = await createIssue({ userId: auth.currentUser.uid, description: desc, photos: [{ uri: img }], status: 'pending' });
    setLoading(false);
    if (res.success) navigation.navigate('MyIssues');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView style={{ padding: SPACING.lg }}>
        <Text style={styles.label}>Describe Issue</Text>
        <TextInput style={styles.input} multiline numberOfLines={4} placeholder="What needs fixing?" onChangeText={setDesc} />
        
        <TouchableOpacity style={styles.photoBox} onPress={handlePick}>
          {img ? <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="camera" size={40} color={COLORS.primary} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.sendText}>Submit Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, marginBottom: 20, textAlignVertical: 'top' },
  photoBox: { height: 200, backgroundColor: '#F8F9FA', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  sendBtn: { backgroundColor: COLORS.success, padding: 18, borderRadius: 12, alignItems: 'center' },
  sendText: { color: 'white', fontWeight: 'bold' },
});