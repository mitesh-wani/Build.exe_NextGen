import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile } from '../services/firebaseServices';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

  const handleAuth = async () => {
    const { email, password, name, phone } = formData;
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Required fields are missing');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const u = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(u.user.uid, { email, displayName: name, phone, role: 'citizen' });
      }
    } catch (e) {
      Alert.alert('Auth Error', e.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <MaterialIcons name="location-city" size={50} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>UrbanFix</Text>
      </View>
      <View style={styles.form}>
        {!isLogin && (
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={(t) => setFormData({...formData, name: t})} />
        )}
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={(t) => setFormData({...formData, email: t})} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(t) => setFormData({...formData, password: t})} />
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>{isLogin ? 'Login' : 'Sign Up'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, textAlign: 'center' }}>{isLogin ? "Need an account? Sign Up" : "Have an account? Login"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginTop: 15 },
  form: { paddingHorizontal: 30 },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});