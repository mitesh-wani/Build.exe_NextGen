// App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    // Register for push notifications (skip if in Expo Go)
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        console.log('✅ Notification permissions granted');
      }
    } catch (error) {
      // Silently fail in Expo Go - will work in production build
      console.log('ℹ️ Notifications not available in Expo Go');
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}