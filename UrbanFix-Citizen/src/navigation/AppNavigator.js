// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { auth } from '../services/firebase'; // adjust path if needed
import { COLORS, SPACING, SIZES } from '../constants/theme';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyIssuesScreen from '../screens/MyIssuesScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: { marginBottom: -4 },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size + 2} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Report"
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size + 6} color={color} />
          ),
          tabBarStyle: { display: 'none' }, // optional: hide tab bar when reporting
        }}
      />

      <Tab.Screen
        name="MyIssues"
        component={MyIssuesScreen}
        options={{
          tabBarLabel: 'My Issues',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="format-list-bulleted" size={size + 2} color={color} />
          ),
          // Example: you can add badge later
          // tabBarBadge: 3,
          // tabBarBadgeStyle: { backgroundColor: COLORS.danger }
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading UrbanFix...</Text>
    </View>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="IssueDetail"
              component={IssueDetailScreen}
              options={{
                headerShown: true,
                title: 'Issue Details',
                headerStyle: {
                  backgroundColor: COLORS.white,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: COLORS.dark,
                headerTitleStyle: {
                  fontWeight: '700',
                  fontSize: SIZES.xl,
                },
              }}
            />
            {/* Add more stack screens here in future (EditProfile, Notifications, etc.) */}
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    height: 68,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  tabLabel: {
    fontSize: SIZES.sm - 1,
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: SIZES.lg,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
});