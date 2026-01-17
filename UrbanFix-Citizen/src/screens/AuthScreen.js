// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleAuth = async () => {
    const { email, password, name } = formData;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An error occurred';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="location-city" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>UrbanFix</Text>
        <Text style={styles.subtitle}>Report civic issues, track solutions</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAuth} 
          disabled={loading === true}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  activeTabText: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.lg,
    color: COLORS.dark,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: 'bold',
  },
});