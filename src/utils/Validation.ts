// Validation utilities for SCMA Mental Health App
// Context7 MCP Implementation for Form Validation
// 1. Context: Secure and user-friendly form validation
// 2. Constraints: Malaysian phone numbers, email formats, password security
// 3. Components: Email, password, phone, name validation functions
// 4. Connections: Used across all form components
// 5. Code: TypeScript validation functions with clear error messages
// 6. Checks: Comprehensive validation rules and edge cases
// 7. Changes: Iterative improvements based on user feedback

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required'
  }
  
  if (!email.trim()) {
    return 'Email cannot be empty'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  if (email.length > 254) {
    return 'Email address is too long'
  }
  
  return null
}

// Password validation with options
interface PasswordOptions {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
}

export const validatePassword = (
  password: string, 
  options: PasswordOptions = {}
): string | null => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options
  
  if (!password) {
    return 'Password is required'
  }
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return 'Password must contain at least one number'
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  
  return null
}

// Confirm password validation
export const validateConfirmPassword = (
  password: string, 
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  
  return null
}

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name) {
    return `${fieldName} is required`
  }
  
  if (!name.trim()) {
    return `${fieldName} cannot be empty`
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`
  }
  
  if (name.length > 100) {
    return `${fieldName} is too long (maximum 100 characters)`
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
  }
  
  return null
}

// Malaysian phone number validation
export const validateMalaysianPhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required'
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Malaysian phone number patterns
  const patterns = [
    /^60\d{9,10}$/, // International format: +60xxxxxxxxx
    /^0\d{9,10}$/, // Local format: 0xxxxxxxxx
    /^\d{9,10}$/, // Without country code: xxxxxxxxx
  ]
  
  const isValid = patterns.some(pattern => pattern.test(cleanPhone))
  
  if (!isValid) {
    return 'Please enter a valid Malaysian phone number'
  }
  
  return null
}

// Age validation
export const validateAge = (age: string | number): string | null => {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age
  
  if (!age && age !== 0) {
    return 'Age is required'
  }
  
  if (isNaN(ageNum)) {
    return 'Age must be a valid number'
  }
  
  if (ageNum < 13) {
    return 'You must be at least 13 years old to use this app'
  }
  
  if (ageNum > 120) {
    return 'Please enter a valid age'
  }
  
  return null
}

// Emergency contact validation
export const validateEmergencyContact = (contact: {
  name: string
  phone: string
  relationship?: string
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  const nameError = validateName(contact.name, 'Contact name')
  if (nameError) {
    errors.name = nameError
  }
  
  const phoneError = validateMalaysianPhone(contact.phone)
  if (phoneError) {
    errors.phone = phoneError
  }
  
  if (contact.relationship && contact.relationship.trim().length === 0) {
    errors.relationship = 'Relationship cannot be empty if provided'
  }
  
  return errors
}

// Location validation (Malaysian states)
export const validateMalaysianLocation = (location: string): string | null => {
  if (!location) {
    return 'Location is required'
  }
  
  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
    'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
  ]
  
  const isValidState = malaysianStates.some(state => 
    state.toLowerCase() === location.toLowerCase()
  )
  
  if (!isValidState) {
    return 'Please select a valid Malaysian state'
  }
  
  return null
}

// General text validation
export const validateText = (
  text: string, 
  fieldName: string, 
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    patternMessage?: string
  } = {}
): string | null => {
  const {
    required = true,
    minLength = 0,
    maxLength = 1000,
    pattern,
    patternMessage = 'Invalid format'
  } = options
  
  if (required && (!text || !text.trim())) {
    return `${fieldName} is required`
  }
  
  if (text && text.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`
  }
  
  if (text && text.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`
  }
  
  if (text && pattern && !pattern.test(text)) {
    return patternMessage
  }
  
  return null
}

// Validate multiple fields at once
export const validateForm = (
  data: { [key: string]: any },
  validationRules: { [key: string]: (value: any) => string | null }
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {}
  
  Object.keys(validationRules).forEach(field => {
    const error = validationRules[field](data[field])
    if (error) {
      errors[field] = error
    }
  })
  
  return errors
}

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number
  feedback: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
} => {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Add numbers')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Add special characters')
  
  const strengthLevels = ['weak', 'weak', 'fair', 'good', 'strong'] as const
  
  return {
    score,
    feedback,
    strength: strengthLevels[score] || 'weak'
  }
}

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateMalaysianPhone,
  validateAge,
  validateEmergencyContact,
  validateMalaysianLocation,
  validateText,
  validateForm,
  getPasswordStrength,
}
