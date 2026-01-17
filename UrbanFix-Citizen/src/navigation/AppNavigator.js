import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { auth } from '../services/firebase'; 
import { COLORS, SPACING, SIZES } from '../constants/theme';

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
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle" size={size + 6} color={color} />,
          // tabBarStyle: { display: 'none' } REMOVED to keep navigation visible
        }}
      />
      <Tab.Screen
        name="MyIssues"
        component={MyIssuesScreen}
        options={{
          tabBarLabel: 'My Issues',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="format-list-bulleted" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size + 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: 70,
    paddingBottom: 10,
    elevation: 0,
  },
  tabLabel: { fontSize: 12, fontWeight: '600' },
});