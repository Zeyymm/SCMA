import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = 'YOUR_SUPABASE_URL' // e.g., 'https://xyzcompany.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // Your anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database table names for type safety
export const TABLES = {
  USER_PROFILES: 'user_profiles',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  USER_PREFERENCES: 'user_preferences',
  HEALTH_RECORDS: 'health_records',
  CHAT_CONVERSATIONS: 'chat_conversations',
  CHAT_MESSAGES: 'chat_messages',
  BREATHING_EXERCISES: 'breathing_exercises',
  USER_EXERCISE_SESSIONS: 'user_exercise_sessions',
} as const

// Supabase MCP (Model-Code-Plan) Configuration
export const SUPABASE_CONFIG = {
  // Authentication settings
  auth: {
    redirectTo: undefined, // For mobile, we don't need redirect URLs
    flowType: 'pkce', // Use PKCE flow for mobile apps
  },
  
  // Real-time settings
  realtime: {
    enabled: true,
    heartbeatIntervalMs: 30000,
  },
  
  // Storage settings
  storage: {
    buckets: {
      PROFILE_IMAGES: 'profile-images',
      HEALTH_DOCUMENTS: 'health-documents',
    },
  },
} as const

// Error handling for Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error)
  
  // Common error messages mapping
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please check your email and confirm your account.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  }
  
  return errorMessages[error.message] || error.message || 'An unexpected error occurred.'
}

// Type definitions for Supabase responses
export interface SupabaseResponse<T> {
  data: T | null
  error: any
}

// Helper function for consistent error handling
export const executeSupabaseOperation = async <T>(
  operation: () => Promise<SupabaseResponse<T>>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const result = await operation()
    
    if (result.error) {
      return {
        data: null,
        error: handleSupabaseError(result.error),
      }
    }
    
    return {
      data: result.data,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
    }
  }
}

// Supabase client health check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    return !error
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// Export configured client
export default supabase
