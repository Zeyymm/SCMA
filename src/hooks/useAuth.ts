import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase, executeSupabaseOperation } from '../config/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Context7 MCP Implementation for Authentication
// 1. Context: User authentication and session management
// 2. Constraints: Secure token storage, session persistence
// 3. Components: Auth context, hooks, error handling
// 4. Connections: Supabase Auth API, AsyncStorage
// 5. Code: TypeScript implementation with proper types
// 6. Checks: Session validation, error handling
// 7. Changes: Iterative improvements based on usage

interface UserProfile {
  id: string
  full_name?: string
  age?: number
  location?: string
  phone?: string
  profile_image_url?: string
  onboarding_completed: boolean
  buddy_assigned_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  // User state
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  
  // Loading states
  loading: boolean
  initializing: boolean
  
  // Authentication methods
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  
  // Onboarding
  completeOnboarding: () => Promise<{ error: string | null }>
  
  // Session management
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // State management
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setInitializing(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initializeAuth = async () => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else if (session) {
        setSession(session)
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      setInitializing(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await executeSupabaseOperation(async () => {
      return await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
    })

    if (data) {
      setUserProfile(data)
    } else if (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData?: Partial<UserProfile>
  ): Promise<{ error: string | null }> => {
    setLoading(true)
    
    try {
      const { data, error } = await executeSupabaseOperation(async () => {
        return await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData || {},
          },
        })
      })

      if (error) {
        return { error }
      }

      // If signup successful and user is confirmed, create profile
      if (data?.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        return { error: null }
      }

      return { error: null }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true)
    
    try {
      const { data, error } = await executeSupabaseOperation(async () => {
        return await supabase.auth.signInWithPassword({
          email,
          password,
        })
      })

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<{ error: string | null }> => {
    setLoading(true)
    
    try {
      // Clear local storage
      await AsyncStorage.multiRemove(['userSession', 'userProfile'])
      
      const { error } = await executeSupabaseOperation(async () => {
        return await supabase.auth.signOut()
      })

      if (!error) {
        setUser(null)
        setSession(null)
        setUserProfile(null)
      }

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'No authenticated user' }
    }

    setLoading(true)
    
    try {
      const { data, error } = await executeSupabaseOperation(async () => {
        return await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()
      })

      if (data) {
        setUserProfile(data)
      }

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const completeOnboarding = async (): Promise<{ error: string | null }> => {
    return await updateProfile({ onboarding_completed: true })
  }

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    initializing,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    completeOnboarding,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
