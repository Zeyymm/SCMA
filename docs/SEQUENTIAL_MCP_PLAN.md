# Sequential MCP Implementation Plan
## Mental Health Support App MVP

### Overview
This document outlines the sequential Model-Code-Plan (MCP) approach for building the mental health support app MVP within a 1-week timeline.

## Pre-Development Setup

### Required Accounts & Services
1. **Supabase Account**: Create free tier account at supabase.com
2. **Google Cloud Account**: For Gemini API access
3. **Expo Account**: For building and deploying the app

### Development Environment
```bash
# Required installations
npm install -g @expo/cli
npm install -g eas-cli
```

### Project Dependencies
```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "@supabase/supabase-js": "^2.38.0",
    "react-native-url-polyfill": "^2.0.0",
    "victory-native": "^36.6.0",
    "react-native-youtube-iframe": "^2.3.0",
    "@google/generative-ai": "^0.1.0",
    "expo-image-picker": "~14.3.0",
    "expo-linking": "~5.0.0",
    "expo-notifications": "~0.20.0",
    "@react-native-async-storage/async-storage": "1.18.2"
  }
}
```

## Day 1: Foundation Setup

### Step 1.1: Project Initialization
```bash
# Create Expo project
npx create-expo-app MentalHealthApp --template typescript
cd MentalHealthApp

# Install core dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

### Step 1.2: Supabase Configuration
1. Create new Supabase project
2. Copy project URL and anon key
3. Create environment configuration:

```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 1.3: Database Schema Setup
Execute in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  profile_image_url TEXT,
  emergency_contacts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health data table
CREATE TABLE health_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  heart_rate INTEGER,
  spo2 INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source TEXT DEFAULT 'dataset'
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  type TEXT NOT NULL, -- 'hospital', 'ambulance', 'taliankasih', 'befrienders'
  active BOOLEAN DEFAULT true
);

-- User buddies
CREATE TABLE user_buddies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  buddy_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  priority_order INTEGER
);

-- Breathing exercises
CREATE TABLE breathing_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  difficulty_level TEXT DEFAULT 'beginner'
);

-- Chat sessions and messages
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0
);

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  message_text TEXT NOT NULL,
  is_ai_response BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crisis_detected BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own health data" ON health_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own buddies" ON user_buddies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
```

### Step 1.4: Authentication Implementation
Create authentication context and screens:

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Step 1.5: Navigation Structure
```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { useAuth } from '../contexts/AuthContext'

// Import screens (to be created)
import AuthScreen from '../screens/AuthScreen'
import DashboardScreen from '../screens/DashboardScreen'
import ProfileScreen from '../screens/ProfileScreen'
import HealthMonitorScreen from '../screens/HealthMonitorScreen'
import EmergencyScreen from '../screens/EmergencyScreen'
import BreathingScreen from '../screens/BreathingScreen'
import ChatScreen from '../screens/ChatScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Health" component={HealthMonitorScreen} />
    <Tab.Screen name="Emergency" component={EmergencyScreen} />
    <Tab.Screen name="Breathing" component={BreathingScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
  </Tab.Navigator>
)

export const AppNavigator = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

## Day 2-7: Feature Implementation

### Day 2: Dashboard & Profile
- Implement dashboard with health summary widgets
- Create profile management with image upload
- Set up settings screen with preferences

### Day 3: Health Monitoring
- Import sample health datasets
- Implement Victory Native charts
- Create health data visualization components

### Day 4: Emergency & Buddy System
- Implement React Native Linking for phone calls
- Create emergency contacts management
- Build buddy calling interface

### Day 5: Breathing Exercises
- Integrate YouTube video components
- Create exercise library interface
- Implement progress tracking

### Day 6: AI Chat Integration
- Set up Gemini API integration
- Implement real-time chat interface
- Add crisis detection logic

### Day 7: Testing & Build
- Comprehensive testing of all features
- UI/UX polish and bug fixes
- Build APK for exhibition

## Success Criteria

### Functional Requirements
✅ User registration and authentication
✅ Dashboard with 6 feature navigation
✅ Profile management with image upload
✅ Health data visualization with charts
✅ Emergency and buddy calling functionality
✅ Breathing exercise video library
✅ AI chat with crisis detection
✅ APK build for exhibition

### Performance Targets
- App launch time < 3 seconds
- Chat response time < 2 seconds
- Emergency call initiation < 1 second
- Smooth navigation between features

## Risk Mitigation Strategies

### Technical Risks
1. **API Integration Issues**: Test early, implement fallbacks
2. **Build Problems**: Regular APK testing
3. **Performance Issues**: Optimize queries and components
4. **Third-party Dependencies**: Have backup solutions

### Timeline Risks
1. **Feature Scope Creep**: Stick to MVP requirements
2. **Integration Delays**: Parallel development where possible
3. **Testing Time**: Continuous testing during development

This sequential plan ensures systematic development with clear milestones and deliverables for each day.
