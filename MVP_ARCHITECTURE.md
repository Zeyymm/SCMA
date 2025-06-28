# Mental Health Support App - MVP Architecture Document

## Project Overview
**Timeline**: 1 week development
**Target Users**: 5 concurrent users maximum (FYP exhibition)
**Geographic Scope**: Malaysia
**Platform**: Mobile (React Native with Expo)

## Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Tab + Stack)
- **Charts**: Victory Native for health data visualization
- **Video**: React Native YouTube or WebView for breathing exercises
- **State Management**: React Context API or Redux Toolkit

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Integration**: Gemini API for AI chat
- **Phone Integration**: React Native Linking API

### Database & Authentication
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Real-time**: Supabase real-time subscriptions
- **Storage**: Supabase Storage for profile images

### Additional Services
- **AI Chat**: Google Gemini API
- **Video Content**: YouTube embedded videos
- **Push Notifications**: Expo Notifications (if time permits)

## Core Features Architecture

### 1. Authentication & Onboarding
**Flow**: Register → Email Verification → Login → Onboarding → Dashboard

**Components**:
- `AuthScreen` (Login/Register toggle)
- `OnboardingFlow` (3-step setup)
- `ProfileSetup` (initial profile creation)

**Database Tables**:
```sql
users (
  id, email, password_hash, created_at, updated_at,
  profile_completed, onboarding_completed
)

user_profiles (
  user_id, full_name, phone, emergency_contacts,
  profile_image_url, preferences
)
```

### 2. Dashboard & Navigation
**Layout**: Tab navigation with 6 main features

**Components**:
- `DashboardHome` (health overview + quick actions)
- `TabNavigator` (6 feature tabs)
- `HealthSummaryWidget`
- `QuickActionButtons`

### 3. Profile & Settings
**Features**: CRUD operations for user data

**Components**:
- `ProfileScreen`
- `SettingsScreen`
- `EditProfileForm`
- `ImagePicker` for profile photos

**Database Tables**:
```sql
user_settings (
  user_id, notification_preferences, privacy_settings,
  theme_preference, language
)
```

### 4. Heart Rate & SpO2 Monitoring
**Data Source**: Pre-loaded datasets (CSV/JSON)
**Visualization**: Line charts for trends

**Components**:
- `HealthMonitorScreen`
- `HeartRateChart`
- `SpO2Chart`
- `HealthSummary`

**Database Tables**:
```sql
health_data (
  id, user_id, heart_rate, spo2, recorded_at,
  data_source, notes
)

health_datasets (
  id, dataset_name, data_points, imported_at
)
```

### 5. Emergency & Buddy Calling
**Emergency Contacts**: Hospital, Ambulance, Taliankasih, BefriendersKL
**Personal Buddies**: 4 personalized contacts per user

**Components**:
- `EmergencyCallScreen`
- `BuddyCallScreen`
- `ContactCard`
- `CallHistoryList`

**Database Tables**:
```sql
emergency_contacts (
  id, name, phone_number, type, active
)

user_buddies (
  user_id, buddy_name, phone_number, relationship,
  priority_order
)

call_logs (
  user_id, contact_type, phone_number, call_time,
  call_duration
)
```

### 6. Breathing Exercise Video Library
**Content**: 4 curated YouTube videos
**Videos**:
1. Michelle Kenway - https://www.youtube.com/watch?v=acUZdGd_3Dg
2. iHasco - https://www.youtube.com/watch?v=Dx112W4i5I0
3. Hands-On Meditation - https://www.youtube.com/watch?v=LiUnFJ8P4gM
4. The Pet Collective - https://www.youtube.com/watch?v=3URtTIdnXIk

**Components**:
- `BreathingExerciseScreen`
- `VideoCard`
- `VideoPlayer` (WebView or YouTube component)
- `ExerciseProgress`

**Database Tables**:
```sql
breathing_exercises (
  id, title, youtube_url, description, duration,
  difficulty_level, created_at
)

user_exercise_progress (
  user_id, exercise_id, completed_at, rating,
  notes
)
```

### 7. AI Chat Support
**AI Provider**: Google Gemini API
**Features**: Real-time chat, crisis detection, chat history

**Components**:
- `ChatScreen`
- `MessageBubble`
- `ChatInput`
- `CrisisAlert` (for suicidal mentions)

**Database Tables**:
```sql
chat_sessions (
  id, user_id, started_at, ended_at, message_count
)

chat_messages (
  id, session_id, user_id, message_text, is_ai_response,
  timestamp, crisis_detected
)
```

## API Endpoints Structure

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/profile`

### Health Data
- `GET /health/data/:userId`
- `POST /health/data`
- `GET /health/summary/:userId`

### Emergency & Buddies
- `GET /contacts/emergency`
- `GET /contacts/buddies/:userId`
- `POST /contacts/buddies`
- `POST /calls/log`

### AI Chat
- `POST /chat/message`
- `GET /chat/history/:userId`
- `POST /chat/session/start`

### Breathing Exercises
- `GET /exercises/breathing`
- `POST /exercises/progress`

## Development Timeline (7 Days)

### Day 1: Project Setup & Authentication
- Initialize Expo project
- Set up Supabase project and database
- Implement authentication screens
- Basic navigation structure

### Day 2: Dashboard & Profile Management
- Create main dashboard layout
- Implement profile CRUD operations
- Set up navigation between features
- Basic styling and UI components

### Day 3: Health Monitoring Feature
- Import health datasets to Supabase
- Create chart components
- Implement health data visualization
- Health summary calculations

### Day 4: Emergency & Buddy Calling
- Implement calling functionality
- Create emergency contacts UI
- Buddy management system
- Call logging

### Day 5: Breathing Exercises & Video Integration
- Set up video components
- Integrate YouTube videos
- Exercise progress tracking
- Video library UI

### Day 6: AI Chat Integration
- Integrate Gemini API
- Implement chat interface
- Crisis detection logic
- Chat history storage

### Day 7: Testing, Polish & APK Build
- End-to-end testing
- UI/UX improvements
- Bug fixes
- Build APK for exhibition

## Security & Privacy Considerations

### Data Protection
- Use Supabase Row Level Security (RLS)
- Encrypt sensitive data at rest
- Implement proper session management
- Validate all user inputs

### API Security
- Rate limiting for Gemini API calls
- Secure API key storage
- Input sanitization for chat messages
- Crisis detection protocols

## Performance Optimization

### Caching Strategy
- Cache health data locally using AsyncStorage
- Cache chat history for offline viewing
- Image caching for profile photos
- Video thumbnail caching

### Data Management
- 90-day data retention policy
- Lazy loading for large datasets
- Pagination for chat history
- Optimized database queries

## Crisis Intervention Protocol

### Suicidal Content Detection
1. Keyword detection in chat messages
2. Immediate crisis alert display
3. Provide emergency contact numbers
4. Log incident for review
5. Suggest professional help resources

### Emergency Response
- One-tap emergency calling
- Location sharing (if possible)
- Emergency contact notification
- Crisis helpline integration

## Deployment Strategy

### APK Build Process
1. Expo build configuration
2. Environment variable setup
3. Production database migration
4. APK generation for exhibition
5. Testing on physical devices

### Environment Setup
- Development: Local Supabase instance
- Production: Hosted Supabase project
- API keys management
- Build configurations

## Success Metrics (Exhibition)

### Functional Requirements
- All 6 features working correctly
- Smooth user registration/login
- Successful emergency calling
- AI chat responding appropriately
- Health data visualization working
- Video playback functioning

### Performance Targets
- App launch time < 3 seconds
- Chat response time < 2 seconds
- Emergency call initiation < 1 second
- Smooth navigation between features
- No crashes during demonstration

## Risk Mitigation

### Technical Risks
- **API Rate Limits**: Implement local fallbacks
- **Video Loading**: Cache thumbnails, fallback to web links
- **Database Performance**: Optimize queries, use indexes
- **Build Issues**: Test APK build early

### Timeline Risks
- **Feature Scope**: Prioritize core functionality
- **Integration Issues**: Test integrations early
- **UI Polish**: Use pre-built component libraries

## Post-MVP Considerations

### Scalability Preparation
- Database indexing strategy
- API optimization
- Caching layer implementation
- Monitoring and logging setup

### Future Enhancements
- Real IoT device integration
- Advanced analytics
- Community features
- Healthcare provider integration
