-- SCMA Mental Health App - User Tables Migration
-- Context7 MCP Implementation for Database Schema
-- 1. Context: User management and profile data storage
-- 2. Constraints: Supabase auth integration, Malaysian user data
-- 3. Components: User profiles, emergency contacts, preferences
-- 4. Connections: Extends auth.users, RLS policies
-- 5. Code: PostgreSQL with proper constraints and indexes
-- 6. Checks: Data validation, security policies
-- 7. Changes: Schema evolution support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(100),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  location VARCHAR(50),
  phone VARCHAR(20),
  profile_image_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  buddy_assigned_id UUID REFERENCES user_profiles(id),
  emergency_contact_count INTEGER DEFAULT 0 CHECK (emergency_contact_count >= 0 AND emergency_contact_count <= 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(50),
  priority_order INTEGER DEFAULT 1 CHECK (priority_order >= 1 AND priority_order <= 4),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique priority per user
  UNIQUE(user_id, priority_order)
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  privacy_data_sharing BOOLEAN DEFAULT FALSE,
  privacy_analytics BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ms')),
  theme VARCHAR(10) DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  crisis_intervention_enabled BOOLEAN DEFAULT TRUE,
  buddy_notifications BOOLEAN DEFAULT TRUE,
  health_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_completed);
CREATE INDEX idx_user_profiles_buddy ON user_profiles(buddy_assigned_id);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(user_id, priority_order);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view own emergency contacts" ON emergency_contacts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts" ON emergency_contacts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts" ON emergency_contacts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts" ON emergency_contacts 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update emergency contact count
CREATE OR REPLACE FUNCTION update_emergency_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles 
    SET emergency_contact_count = (
      SELECT COUNT(*) FROM emergency_contacts 
      WHERE user_id = NEW.user_id AND is_active = TRUE
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE user_profiles 
    SET emergency_contact_count = (
      SELECT COUNT(*) FROM emergency_contacts 
      WHERE user_id = NEW.user_id AND is_active = TRUE
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET emergency_contact_count = (
      SELECT COUNT(*) FROM emergency_contacts 
      WHERE user_id = OLD.user_id AND is_active = TRUE
    )
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain emergency contact count
CREATE TRIGGER emergency_contact_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_emergency_contact_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
