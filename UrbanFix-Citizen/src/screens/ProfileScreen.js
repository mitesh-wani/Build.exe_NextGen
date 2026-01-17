// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Import theme constants (adjust path if needed)
import { COLORS, SPACING, BORDER_RADIUS, SIZES } from '../constants/theme';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        console.log('No user document found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Expo Router will automatically redirect to login (if configured)
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {/* Future: replace with userProfile?.photoURL ? <Image ... /> : ... */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(userProfile?.name)}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>
          {userProfile?.name || 'Welcome'}
        </Text>
        <Text style={styles.email}>
          {userProfile?.email || auth.currentUser?.email || 'No email'}
        </Text>

        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
          <Text style={styles.badgeText}>Verified Citizen</Text>
        </View>
      </View>

      {/* Sections */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="person-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="call-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Phone Number</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>
              {userProfile?.phone || 'Not set'}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="language-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Language</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>English</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Terms & Conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="shield-outline" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ by Team NextGen</Text>
        <Text style={styles.footerSubtext}>UrbanFix • v1.0.0</Text>
      </View>

      {/* Bottom safe area */}
      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },

  header: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  avatarContainer: {
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  badgeText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray[500],
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.gray[200],
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    flex: 1,
  },
  menuText: {
    fontSize: SIZES.lg,
    color: COLORS.dark,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuValue: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.danger,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: SIZES.md,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.gray[400],
    marginTop: SPACING.xs,
  },
});