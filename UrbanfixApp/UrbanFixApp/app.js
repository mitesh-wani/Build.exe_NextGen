import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import MyIssuesScreen from './src/screens/MyIssuesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator (After Login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'My Issues') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Report" 
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report Issue',
        }}
      />
      <Tab.Screen name="My Issues" component={MyIssuesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
function RootNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔥 Auth state changed:', currentUser ? `Logged in as ${currentUser.email}` : 'Logged out');
      console.log('👤 User ID:', currentUser?.uid);
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log('🔴 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  console.log('📱 App render - Loading:', loading, 'User:', user ? 'Yes' : 'No');

  if (loading) {
    // Show a loading screen while checking auth state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24 }}>🏙️ UrbanFix</Text>
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen 
            name="IssueDetail" 
            component={IssueDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Issue Details'
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}