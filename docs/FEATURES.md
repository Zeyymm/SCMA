# Mental Health Support App - Feature Specifications

## File System Structure

### Frontend Repository Structure (React Native)
```
/src
  /components
    /common
      - Button.tsx
      - Input.tsx
      - Card.tsx
      - LoadingSpinner.tsx
      - Modal.tsx
    /dashboard
      - DashboardWidget.tsx
      - HealthStatusCard.tsx
      - QuickActionButton.tsx
    /auth
      - LoginForm.tsx
      - RegisterForm.tsx
      - OnboardingStep.tsx
    /profile
      - ProfileForm.tsx
      - ContactManager.tsx
      - SettingsPanel.tsx
    /monitoring
      - HeartRateChart.tsx
      - SpO2Chart.tsx
      - HealthTrends.tsx
    /emergency
      - EmergencyButton.tsx
      - ContactCard.tsx
      - CallHistory.tsx
    /breathing
      - VideoPlayer.tsx
      - ExerciseCard.tsx
      - ProgressTracker.tsx
    /chat
      - ChatInterface.tsx
      - MessageBubble.tsx
      - CrisisDetection.tsx
  /screens
    /auth
      - LoginScreen.tsx
      - RegisterScreen.tsx
      - OnboardingScreen.tsx
    /dashboard
      - DashboardScreen.tsx
    /profile
      - ProfileScreen.tsx
      - SettingsScreen.tsx
    /monitoring
      - HealthMonitoringScreen.tsx
      - HealthHistoryScreen.tsx
    /emergency
      - EmergencyScreen.tsx
      - ContactsScreen.tsx
    /breathing
      - BreathingExercisesScreen.tsx
      - VideoPlayerScreen.tsx
    /chat
      - ChatScreen.tsx
  /navigation
    - AppNavigator.tsx
    - TabNavigator.tsx
    - StackNavigator.tsx
  /services
    - AuthService.ts
    - DatabaseService.ts
    - ChatService.ts
    - HealthDataService.ts
    - EmergencyService.ts
    - NotificationService.ts
  /utils
    - Validation.ts
    - Constants.ts
    - Helpers.ts
    - CrisisDetection.ts
  /hooks
    - useAuth.ts
    - useHealth.ts
    - useChat.ts
    - useEmergency.ts
  /types
    - User.ts
    - Health.ts
    - Chat.ts
    - Emergency.ts
  /assets
    /images
    /videos
    /icons
```

### Backend Repository Structure (Supabase Configuration)
```
/database
  /migrations
    - 001_create_users_table.sql
    - 002_create_health_records_table.sql
    - 003_create_emergency_contacts_table.sql
    - 004_create_chat_history_table.sql
    - 005_create_breathing_exercises_table.sql
    - 006_create_user_preferences_table.sql
  /functions
    - process_health_data.sql
    - emergency_notification.sql
    - crisis_detection.sql
  /policies
    - rls_policies.sql
  /seeds
    - sample_health_data.sql
    - breathing_exercises_data.sql
/edge-functions
  /gemini-chat
    - index.ts
  /crisis-detection
    - index.ts
  /notification-handler
    - index.ts
/config
  - supabase.ts
  - gemini-config.ts
  - youtube-config.ts
```

## Feature 1: User Authentication & Onboarding

### Feature Goal
Implement secure user authentication with comprehensive onboarding flow to ensure users are properly set up with buddy assignments and profile completion.

### API Relationships
- Supabase Auth API for authentication operations
- Supabase Database API for profile management
- Email verification service integration

### Detailed Feature Requirements

#### User Registration
- Email/password authentication with minimum 8 characters, 1 special character requirement
- Real-time password strength validation
- Email format validation with regex pattern
- Duplicate email prevention with clear error messaging
- Terms of service and privacy policy acceptance

#### Email Verification
- Automated email sending via Supabase Auth
- Verification link with 24-hour expiration
- Resend verification functionality with 5-minute cooldown
- Clear verification status indicators in UI

#### Secure Login
- Session management with 30-day expiration
- Remember me functionality with secure token storage
- Failed login attempt tracking (max 5 attempts, 15-minute lockout)
- Password reset functionality with email verification

#### Onboarding Flow
- Multi-step progressive disclosure design (5 steps total)
- Step 1: Welcome and app overview
- Step 2: Personal information collection (name, age, location in Malaysia)
- Step 3: Emergency contact setup (minimum 1, maximum 4 contacts)
- Step 4: Health preferences and baseline data entry
- Step 5: Buddy assignment with explanation of support system

### Database Schema
```sql
-- Extended user profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  location VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  buddy_assigned_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **SETUP_AUTH**: Configure Supabase Auth and basic authentication
- **IMPLEMENT_FORMS**: Create login/register forms with validation
- **EMAIL_VERIFICATION**: Implement email verification flow
- **ONBOARDING_FLOW**: Create multi-step onboarding process
- **BUDDY_ASSIGNMENT**: Implement buddy assignment logic
- **TESTING**: Test all authentication flows
- **COMPLETE**: Feature fully implemented and tested

## Feature 2: Dashboard & Navigation

### Feature Goal
Create central hub providing quick access to all features with personalized health status overview and intuitive navigation patterns.

### API Relationships
- Supabase Database API for user preferences and health data
- Real-time subscriptions for live data updates
- Push notification service integration

### Detailed Feature Requirements

#### Main Navigation Structure
- Bottom tab navigation with 6 primary tabs
- Tab icons with active/inactive states
- Badge notifications for urgent items
- Gesture-based navigation support

#### Health Status Overview
- Real-time health metrics display (heart rate, SpO2 from dataset)
- Traffic light system for health status (green/yellow/red)
- Last updated timestamp
- Quick access to detailed health history

#### Feature Shortcuts
- Emergency call button prominently displayed
- Quick access to breathing exercises
- AI chat support button
- Recent activities summary

#### Personalization
- Customizable widget arrangement
- User preference-based content prioritization
- Buddy status and quick communication
- Daily health tips and reminders

### Database Schema
```sql
CREATE TABLE dashboard_preferences (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  widget_layout JSONB DEFAULT '{}',
  preferred_health_metrics TEXT[],
  notification_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE health_status_cache (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  current_heart_rate INTEGER,
  current_spo2 INTEGER,
  status_level VARCHAR(10) CHECK (status_level IN ('good', 'warning', 'critical')),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **NAVIGATION_SETUP**: Configure React Navigation structure
- **DASHBOARD_LAYOUT**: Create main dashboard layout and widgets
- **HEALTH_OVERVIEW**: Implement health status overview components
- **QUICK_ACTIONS**: Add feature shortcuts and quick actions
- **PERSONALIZATION**: Implement customizable preferences
- **REAL_TIME_DATA**: Add real-time data subscriptions
- **TESTING**: Test navigation and dashboard functionality
- **COMPLETE**: Feature fully implemented and tested

## Feature 3: Profile & Settings Management

### Feature Goal
Provide comprehensive CRUD operations for user profile management with secure data handling and privacy controls.

### API Relationships
- Supabase Database API for profile data
- Supabase Storage API for profile photos
- Image optimization service

### Detailed Feature Requirements

#### Personal Information Management
- Full name, age, location editing
- Profile photo upload with crop functionality
- Contact information management
- Personal health information (allergies, medications, medical conditions)

#### Emergency Contacts Management
- CRUD operations for up to 4 emergency contacts
- Contact validation (phone number format)
- Relationship classification (family, friend, healthcare provider)
- Priority ordering with drag-and-drop interface

#### App Preferences
- Notification settings (push, email, SMS)
- Privacy settings (data sharing, analytics)
- Language preferences (Bahasa Malaysia, English)
- Theme preferences (light, dark, auto)

#### Account Security
- Password change functionality
- Two-factor authentication setup
- Login activity history
- Account deletion with data export option

### Database Schema
```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(50),
  priority_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  privacy_data_sharing BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(10) DEFAULT 'auto',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE profile_photos (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  photo_url TEXT,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **PROFILE_FORMS**: Create profile editing forms and validation
- **PHOTO_UPLOAD**: Implement profile photo upload and crop functionality
- **EMERGENCY_CONTACTS**: Build emergency contacts CRUD operations
- **PREFERENCES**: Implement app preferences and settings
- **SECURITY**: Add account security features
- **DATA_PRIVACY**: Implement privacy controls and data export
- **TESTING**: Test all profile management functionality
- **COMPLETE**: Feature fully implemented and tested

## Feature 4: Heart Rate & SpO2 Monitoring

### Feature Goal
Provide comprehensive health metrics visualization using curated datasets to simulate IoT device readings with historical tracking and trend analysis.

### API Relationships
- Supabase Database API for health records storage
- Chart rendering library (Victory Native)
- Health data import service for CSV/JSON datasets

### Detailed Feature Requirements

#### Data Visualization
- Interactive line charts for heart rate trends (hourly, daily, weekly, monthly views)
- SpO2 level visualization with normal range indicators (95-100%)
- Comparative charts showing heart rate vs SpO2 correlation
- Customizable date range selection

#### Health Metrics Dashboard
- Current readings display with status indicators
- Average, minimum, maximum values per time period
- Trend indicators (improving, stable, declining)
- Alert thresholds with visual warnings

#### Historical Data Management
- 90-day data retention policy
- Data export functionality (CSV, PDF reports)
- Search and filter capabilities by date range
- Data backup and restore functionality

#### Health Insights
- Automated pattern recognition in data
- Correlation analysis between metrics
- Personalized recommendations based on trends
- Integration with breathing exercise effectiveness

### Database Schema
```sql
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
  spo2_level INTEGER CHECK (spo2_level >= 70 AND spo2_level <= 100),
  recorded_at TIMESTAMP NOT NULL,
  data_source VARCHAR(20) DEFAULT 'dataset',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_records_user_date ON health_records(user_id, recorded_at DESC);

CREATE TABLE health_thresholds (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  heart_rate_min INTEGER DEFAULT 60,
  heart_rate_max INTEGER DEFAULT 100,
  spo2_min INTEGER DEFAULT 95,
  custom_thresholds JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE health_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  insight_type VARCHAR(50),
  insight_data JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **DATA_IMPORT**: Set up health dataset import and processing
- **CHART_COMPONENTS**: Create chart components using Victory Native
- **HEALTH_DASHBOARD**: Build health metrics dashboard
- **HISTORICAL_DATA**: Implement historical data management
- **INSIGHTS_ENGINE**: Add health insights and pattern recognition
- **ALERTS_SYSTEM**: Implement threshold alerts and notifications
- **TESTING**: Test all health monitoring functionality
- **COMPLETE**: Feature fully implemented and tested

## Feature 5: Emergency & Buddy Calling System

### Feature Goal
Implement reliable one-touch calling system for emergency services and personal support network with comprehensive contact management and call logging.

### API Relationships
- React Native Linking API for phone calls
- Supabase Database API for contact storage
- Push notification service for emergency alerts
- Location services for emergency context

### Detailed Feature Requirements

#### Emergency Services Integration
- Pre-configured emergency numbers:
  - Hospital: 999
  - Ambulance: 999
  - Taliankasih: 1-767-5270
  - BefriendersKL: 603-7956-8145
- One-touch dialing with confirmation dialog
- Automatic location sharing with emergency services
- Emergency information broadcast to buddy network

#### Buddy Calling System
- Quick dial interface for 4 personal contacts
- Priority calling sequence (call 1st buddy, if no answer, try 2nd, etc.)
- Group calling functionality for multiple buddies
- Text message backup if call fails

#### Contact Management
- CRUD operations for emergency contacts
- Contact verification through test calls
- Relationship categorization and priority setting
- Integration with device contacts for easy import

#### Call History & Logging
- Detailed call logs with timestamps and duration
- Call outcome tracking (answered, missed, failed)
- Emergency incident reporting
- Integration with health status during emergencies

### Database Schema
```sql
CREATE TABLE emergency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  service_type VARCHAR(30),
  region VARCHAR(50) DEFAULT 'Malaysia',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  contact_type VARCHAR(20) CHECK (contact_type IN ('emergency', 'buddy')),
  contact_id UUID,
  phone_number VARCHAR(20) NOT NULL,
  call_status VARCHAR(20) CHECK (call_status IN ('initiated', 'answered', 'missed', 'failed')),
  call_duration INTEGER DEFAULT 0,
  emergency_context JSONB,
  called_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emergency_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  incident_type VARCHAR(50),
  location_data JSONB,
  health_context JSONB,
  contacts_notified INTEGER DEFAULT 0,
  resolution_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **EMERGENCY_SERVICES**: Set up pre-configured emergency service contacts
- **CALLING_INTERFACE**: Implement React Native Linking for phone calls
- **BUDDY_SYSTEM**: Create buddy calling and management system
- **CALL_LOGGING**: Implement call history and logging functionality
- **EMERGENCY_PROTOCOL**: Add emergency incident management
- **LOCATION_SERVICES**: Integrate location sharing for emergencies
- **TESTING**: Test all calling functionality and emergency protocols
- **COMPLETE**: Feature fully implemented and tested

## Feature 6: Breathing Exercise Video Library

### Feature Goal
Provide curated collection of guided breathing exercises linking to YouTube content for anxiety and depression management with progress tracking.

### API Relationships
- YouTube API or React Native YouTube component
- Supabase Database API for exercise data and progress
- Video streaming capabilities
- Progress tracking system

### Detailed Feature Requirements

#### Video Library Management
- 4 curated breathing exercise videos:
  1. Michelle Kenway - https://www.youtube.com/watch?v=acUZdGd_3Dg
  2. iHasco - https://www.youtube.com/watch?v=Dx112W4i5I0
  3. Hands-On Meditation - https://www.youtube.com/watch?v=LiUnFJ8P4gM
  4. The Pet Collective - https://www.youtube.com/watch?v=3URtTIdnXIk
- Video metadata management (title, duration, difficulty)
- Thumbnail generation and caching
- Video quality selection based on network conditions

#### Exercise Progress Tracking
- Session completion tracking
- Duration and frequency analytics
- Personal progress visualization
- Achievement badges and milestones

#### User Experience Features
- Seamless video playback integration
- Favorite exercises functionality
- Exercise recommendations based on usage
- Offline video access consideration

#### Integration Features
- Integration with health monitoring for effectiveness correlation
- Crisis intervention integration (breathing exercises as coping mechanism)
- Buddy sharing of favorite exercises
- Progress sharing with emergency contacts

### Database Schema
```sql
CREATE TABLE breathing_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id VARCHAR(50) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  thumbnail_url TEXT,
  instructor_name VARCHAR(100),
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  exercise_id UUID REFERENCES breathing_exercises NOT NULL,
  session_duration INTEGER, -- in seconds
  completed BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  mood_before VARCHAR(20),
  mood_after VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_exercise_favorites (
  user_id UUID REFERENCES user_profiles NOT NULL,
  exercise_id UUID REFERENCES breathing_exercises NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, exercise_id)
);

CREATE TABLE exercise_progress_stats (
  user_id UUID REFERENCES user_profiles PRIMARY KEY,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  favorite_exercise_id UUID REFERENCES breathing_exercises,
  last_session_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **VIDEO_INTEGRATION**: Set up YouTube video components and playback
- **EXERCISE_LIBRARY**: Create exercise library interface and management
- **PROGRESS_TRACKING**: Implement session tracking and analytics
- **USER_EXPERIENCE**: Add favorites, recommendations, and personalization
- **HEALTH_INTEGRATION**: Connect with health monitoring and crisis intervention
- **OFFLINE_SUPPORT**: Implement offline video access capabilities
- **TESTING**: Test video playback, progress tracking, and integrations
- **COMPLETE**: Feature fully implemented and tested

## Feature 7: AI Chat Support

### Feature Goal
Provide 24/7 intelligent mental health support through AI-powered conversations with crisis detection and intervention capabilities.

### API Relationships
- Gemini API for AI responses
- Supabase Database API for chat history
- Crisis intervention service integration
- Real-time messaging infrastructure

### Detailed Feature Requirements

#### Chat Interface
- Real-time messaging with typing indicators
- Message history with search functionality
- Rich media support (text, images, quick replies)
- Voice message transcription support

#### AI Response System
- Context-aware conversations using Gemini API
- Mental health-focused response training
- Personalized responses based on user history
- Multi-language support (English, Bahasa Malaysia)

#### Crisis Detection & Intervention
- Keyword and pattern analysis for suicidal ideation
- Automatic escalation to emergency contacts
- Crisis hotline integration and referrals
- Immediate safety planning assistance

#### Data Privacy & Security
- End-to-end encryption for chat messages
- 90-day data retention with secure deletion
- User consent for data processing
- HIPAA-compliant data handling practices

### Database Schema
```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  conversation_title VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations NOT NULL,
  message_text TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  crisis_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crisis_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles NOT NULL,
  message_id UUID REFERENCES chat_messages,
  crisis_level VARCHAR(20) CHECK (crisis_level IN ('low', 'medium', 'high', 'critical')),
  keywords_detected TEXT[],
  intervention_taken JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
```

### Crisis Detection Algorithm
```typescript
function detectCrisis(message: string): CrisisLevel {
  const suicidalKeywords = ["suicide", "kill myself", "end it all", "tidak mahu hidup"];
  const urgentKeywords = ["help me", "emergency", "crisis"];

  let riskScore = 0;

  for (const keyword of suicidalKeywords) {
    if (message.toLowerCase().includes(keyword)) {
      riskScore += 10;
    }
  }

  for (const keyword of urgentKeywords) {
    if (message.toLowerCase().includes(keyword)) {
      riskScore += 5;
    }
  }

  if (riskScore >= 10) {
    triggerCrisisIntervention(user, message);
    return "CRITICAL";
  } else if (riskScore >= 5) {
    return "MEDIUM";
  }

  return "LOW";
}
```

### Implementation States
- **NOT_STARTED**: Initial state before implementation
- **CHAT_INTERFACE**: Create real-time messaging interface and components
- **GEMINI_INTEGRATION**: Integrate Gemini API for AI responses
- **CRISIS_DETECTION**: Implement crisis detection algorithms and keywords
- **INTERVENTION_SYSTEM**: Add automatic escalation and crisis intervention
- **ENCRYPTION_SECURITY**: Implement end-to-end encryption and security
- **REAL_TIME_MESSAGING**: Add WebSocket connections and real-time features
- **TESTING**: Test AI responses, crisis detection, and security
- **COMPLETE**: Feature fully implemented and tested

## System Architecture Overview

### Technology Stack
- **Frontend**: React Native with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: Google Gemini API
- **Video Integration**: YouTube API
- **Push Notifications**: Firebase Cloud Messaging
- **Charts**: Victory Native
- **Navigation**: React Navigation 6

### Deployment Architecture
- **Mobile App**: App Store (iOS) and Google Play Store (Android)
- **Backend**: Supabase Cloud (hosted PostgreSQL)
- **Edge Functions**: Supabase Edge Runtime
- **CDN**: Supabase Storage for media files
- **Monitoring**: Supabase Dashboard + Custom logging

### Integration Points
- **Emergency Services**: Direct phone integration via Linking API
- **Healthcare Providers**: API endpoints for future telehealth integration
- **Wearable Devices**: Structured for future IoT device integration
- **Government Health Systems**: Prepared for Malaysia health system integration

## Security Considerations

### Authentication & Authorization
- **Multi-factor Authentication**: SMS and email verification
- **Role-based Access Control**: User, buddy, admin, healthcare provider roles
- **Session Management**: Secure JWT tokens with refresh mechanism
- **Password Policy**: Minimum 8 characters, complexity requirements

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data at rest
- **Transport Security**: TLS 1.3 for all API communications
- **Database Security**: Row-level security policies in PostgreSQL
- **Privacy Controls**: Granular consent management for data usage

### Vulnerability Protection
- **Input Validation**: Comprehensive validation on all user inputs
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and output encoding
- **Rate Limiting**: API endpoints protected against abuse

## Testing Strategy

### Unit Testing
- **Component Testing**: Jest and React Native Testing Library
- **Service Testing**: Mock external API dependencies
- **Utility Testing**: Coverage for validation and helper functions
- **Database Testing**: Supabase local development setup

### Integration Testing
- **API Integration**: Test all Supabase and external API integrations
- **Authentication Flow**: Complete user journey testing
- **Real-time Features**: WebSocket connection testing
- **Emergency Systems**: Comprehensive calling system testing

### End-to-End Testing
- **User Journeys**: Critical path testing with Detox
- **Cross-platform Testing**: iOS and Android device testing
- **Performance Testing**: Load testing for concurrent users (up to 5)
- **Crisis Scenarios**: Emergency detection and response testing

## Data Management

### Data Lifecycle
- **Data Retention**: 90-day policy for health metrics and chat history
- **Data Archival**: Automated cleanup processes
- **Data Export**: User-initiated data export in JSON format
- **Data Deletion**: Secure deletion with verification

### Caching Strategy
- **Local Storage**: Critical app data cached locally
- **API Response Caching**: Time-based cache invalidation
- **Image Caching**: Optimized image storage and retrieval
- **Offline Support**: Essential features available offline

### Performance Thresholds
- **API Response Time**: < 500ms for critical operations
- **App Launch Time**: < 3 seconds cold start
- **Chart Rendering**: < 1 second for data visualization
- **Emergency Calling**: < 2 seconds to initiate call

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Automated error reporting and alerting
- **Performance Monitoring**: Real-time app performance metrics
- **Usage Analytics**: Feature usage patterns (privacy-compliant)
- **Crash Reporting**: Comprehensive crash analysis and resolution

### Health & Security Monitoring
- **Crisis Detection**: Real-time monitoring of crisis interventions
- **Emergency Response**: Tracking of emergency call success rates
- **Security Events**: Authentication failures and suspicious activities
- **Data Breach Detection**: Automated security incident response

## Sequential MCP Implementation Summary

### Context7 MCP Integration
Each feature follows the 7-layer context framework:
1. **Context**: User needs and business requirements
2. **Constraints**: Technical, timeline, and resource limitations
3. **Components**: Modular architecture breakdown
4. **Connections**: API relationships and data flow
5. **Code**: Implementation states and technical specs
6. **Checks**: Testing strategies and validation
7. **Changes**: Iteration cycles and improvements

### Implementation State Tracking
All features use consistent state progression:
- **NOT_STARTED** → **SETUP** → **CORE_IMPLEMENTATION** → **INTEGRATION** → **TESTING** → **COMPLETE**

### Feature Dependencies
1. **Authentication** (Foundation) → **Dashboard** → **Profile**
2. **Health Monitoring** (Independent) → **Emergency System**
3. **Breathing Exercises** (Independent) → **AI Chat**
4. **AI Chat** → **Crisis Integration** → **Emergency System**

This comprehensive specification provides the complete foundation for building a robust, secure, and user-friendly mental health support application with all required features, security considerations, and implementation guidelines addressed.
