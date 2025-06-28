import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'

import { useAuth } from '../hooks/useAuth'
import AuthScreen from '../screens/auth/AuthScreen'

// Context7 MCP Implementation for App Navigation
// 1. Context: Main navigation structure for authenticated and non-authenticated users
// 2. Constraints: React Navigation setup, authentication state management
// 3. Components: Stack navigator, tab navigator, loading screen
// 4. Connections: Auth context for user state
// 5. Code: TypeScript navigation with proper typing
// 6. Checks: Authentication state validation, loading states
// 7. Changes: Navigation improvements, deep linking support

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Placeholder screens for Day 1 - will be implemented in subsequent days
const DashboardScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Dashboard</Text>
    <Text style={styles.placeholderText}>Welcome to SCMA Mental Health Support App</Text>
    <Text style={styles.placeholderSubtext}>Dashboard will be implemented on Day 2</Text>
  </View>
)

const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Profile</Text>
    <Text style={styles.placeholderText}>Profile management coming soon</Text>
  </View>
)

const HealthScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Health Monitoring</Text>
    <Text style={styles.placeholderText}>Heart rate and SpO2 monitoring</Text>
    <Text style={styles.placeholderSubtext}>Will be implemented on Day 3</Text>
  </View>
)

const EmergencyScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Emergency</Text>
    <Text style={styles.placeholderText}>Emergency calling system</Text>
    <Text style={styles.placeholderSubtext}>Will be implemented on Day 4</Text>
  </View>
)

const BreathingScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Breathing Exercises</Text>
    <Text style={styles.placeholderText}>Guided breathing exercises</Text>
    <Text style={styles.placeholderSubtext}>Will be implemented on Day 5</Text>
  </View>
)

const ChatScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>AI Chat Support</Text>
    <Text style={styles.placeholderText}>24/7 mental health assistance</Text>
    <Text style={styles.placeholderSubtext}>Will be implemented on Day 6</Text>
  </View>
)

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading SCMA...</Text>
  </View>
)

// Main tab navigator for authenticated users
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
      },
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>👤</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Health" 
      component={HealthScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>❤️</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Emergency" 
      component={EmergencyScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>🚨</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Breathing" 
      component={BreathingScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>🧘</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>💬</Text>
        ),
      }}
    />
  </Tab.Navigator>
)

// Main app navigator
const AppNavigator: React.FC = () => {
  const { user, initializing, userProfile } = useAuth()

  // Show loading screen while initializing
  if (initializing) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated
          <>
            {userProfile?.onboarding_completed ? (
              // User has completed onboarding - show main app
              <Stack.Screen name="Main" component={MainTabNavigator} />
            ) : (
              // User needs to complete onboarding - will be implemented in next iteration
              <Stack.Screen name="Main" component={MainTabNavigator} />
            )}
          </>
        ) : (
          // User is not authenticated - show auth screen
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tabIcon: {
    fontSize: 20,
  },
})

export default AppNavigator
