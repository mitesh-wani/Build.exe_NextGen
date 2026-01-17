import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{userProfile?.name || 'User'}</Text>
        <Text style={styles.email}>{userProfile?.email || ''}</Text>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.badgeText}>Verified Citizen</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="call-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Phone</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>{userProfile?.phone || 'Not set'}</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Language</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>English</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Terms & Conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>App Version</Text>
          </View>
          <Text style={styles.menuItemValue}>1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#F44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ by Team NextGen</Text>
        <Text style={styles.footerSubtext}>UrbanFix v1.0.0</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 18,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});