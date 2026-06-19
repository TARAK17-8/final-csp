-- ==============================================================================
-- samaramAI — Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    profile_photo TEXT,
    preferred_language TEXT DEFAULT 'en',
    voice_settings JSONB DEFAULT '{"speed": 1, "isMuted": false, "continuousMode": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEDICAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    report_type TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    extracted_text TEXT,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRESCRIPTION HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.prescription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    prescription_image TEXT NOT NULL,
    ocr_text TEXT,
    translated_text TEXT,
    medicine_list JSONB,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEDICINE SCANS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    scan_image TEXT,
    medicine_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SYMPTOM CHECKS TABLE
CREATE TABLE IF NOT EXISTS public.symptom_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    symptoms TEXT[] NOT NULL,
    selected_answers JSONB,
    assessment_result JSONB NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.voice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    transcript TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TRIGGERS
-- ==============================================================================

-- Trigger to automatically create a user profile on Auth registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, profile_photo)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update 'updated_at' on users
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- USERS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- CHAT HISTORY Policies
CREATE POLICY "Users can view their own chats"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON public.chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- MEDICAL REPORTS Policies
CREATE POLICY "Users can view their own reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- PRESCRIPTION HISTORY Policies
CREATE POLICY "Users can view their own prescriptions"
  ON public.prescription_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions"
  ON public.prescription_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescription_history FOR DELETE
  USING (auth.uid() = user_id);

-- MEDICINE SCANS Policies
CREATE POLICY "Users can view their own scans"
  ON public.medicine_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.medicine_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.medicine_scans FOR DELETE
  USING (auth.uid() = user_id);

-- SYMPTOM CHECKS Policies
CREATE POLICY "Users can view their own symptom checks"
  ON public.symptom_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom checks"
  ON public.symptom_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom checks"
  ON public.symptom_checks FOR DELETE
  USING (auth.uid() = user_id);

-- VOICE SESSIONS Policies
CREATE POLICY "Users can view their own voice sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice sessions"
  ON public.voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice sessions"
  ON public.voice_sessions FOR DELETE
  USING (auth.uid() = user_id);
