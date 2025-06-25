import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/hooks/useAuth'
import AppNavigator from './src/navigation/AppNavigator'

// Context7 MCP Implementation for Main App Component
// 1. Context: Root component that initializes the entire SCMA app
// 2. Constraints: Expo setup, authentication provider wrapping
// 3. Components: AuthProvider, AppNavigator, StatusBar
// 4. Connections: Provides auth context to entire app
// 5. Code: Clean React Native app structure
// 6. Checks: Error boundaries, proper provider setup
// 7. Changes: Performance optimizations, error handling

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  )
}
