import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword,
  validateName,
  getPasswordStrength 
} from '../../utils/Validation'

// Context7 MCP Implementation for Register Form
// 1. Context: New user registration with profile creation
// 2. Constraints: Form validation, password strength, email verification
// 3. Components: Input fields, validation, password strength indicator
// 4. Connections: Auth context, validation utilities
// 5. Code: React Native form with comprehensive validation
// 6. Checks: Real-time validation, password strength feedback
// 7. Changes: UX improvements, accessibility enhancements

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { signUp, loading } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Get password strength
  const passwordStrength = getPasswordStrength(formData.password)

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full name validation
    const nameError = validateName(formData.fullName, 'Full name')
    if (nameError) {
      newErrors.fullName = nameError
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // Password validation
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    // Confirm password validation
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError
    }

    // Terms acceptance
    if (!acceptedTerms) {
      newErrors.general = 'Please accept the Terms of Service and Privacy Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }))
    
    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
      })
      
      if (error) {
        setErrors({ general: error })
      } else {
        // Show success message - email verification required
        setErrors({ 
          general: 'Registration successful! Please check your email to verify your account.' 
        })
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    }
  }

  // Get password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak': return '#f44336'
      case 'fair': return '#ff9800'
      case 'good': return '#2196f3'
      case 'strong': return '#4caf50'
      default: return '#ccc'
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our mental health support community</Text>
          </View>

          {/* General Message */}
          {errors.general && (
            <View style={[
              styles.messageContainer,
              errors.general.includes('successful') ? styles.successContainer : styles.errorContainer
            ]}>
              <Text style={[
                styles.messageText,
                errors.general.includes('successful') ? styles.successText : styles.errorText
              ]}>
                {errors.general}
              </Text>
            </View>
          )}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.fullName && (
              <Text style={styles.fieldError}>{errors.fullName}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.fieldError}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Create a strong password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                </Text>
              </View>
            )}
            
            {errors.password && (
              <Text style={styles.fieldError}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            >
              <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4caf50',
  },
  messageText: {
    fontSize: 14,
  },
  errorText: {
    color: '#c62828',
  },
  successText: {
    color: '#2e7d32',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  fieldError: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    marginBottom: 30,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default RegisterForm
