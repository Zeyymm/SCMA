import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'

// Context7 MCP Implementation for Auth Screen
// 1. Context: Main authentication entry point for the app
// 2. Constraints: Single screen handling both login and register
// 3. Components: LoginForm, RegisterForm, navigation between them
// 4. Connections: Auth context through child components
// 5. Code: React Native screen with state management
// 6. Checks: Form switching, error handling
// 7. Changes: UI improvements, accessibility enhancements

type AuthMode = 'login' | 'register'

const AuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const handleSwitchToRegister = () => {
    setAuthMode('register')
  }

  const handleSwitchToLogin = () => {
    setAuthMode('login')
  }

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be implemented in the next iteration. For now, please contact support if you need to reset your password.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        {authMode === 'login' ? (
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
})

export default AuthScreen
