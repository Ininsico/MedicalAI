-- Parkinson's Tracker Database Schema

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('patient', 'caregiver', 'admin')) DEFAULT 'patient',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tremor INTEGER CHECK (tremor >= 0 AND tremor <= 10),
  stiffness INTEGER CHECK (stiffness >= 0 AND stiffness <= 10),
  balance INTEGER CHECK (balance >= 0 AND balance <= 10),
  sleep INTEGER CHECK (sleep >= 0 AND sleep <= 10),
  mood INTEGER CHECK (mood >= 0 AND mood <= 10),
  medication_adherence TEXT CHECK (medication_adherence IN ('Yes', 'No', 'Partial')),
  side_effects TEXT[],
  other_notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create caregiver_patient_links table
CREATE TABLE IF NOT EXISTS public.caregiver_patient_links (
  caregiver_id UUID REFERENCES auth.users ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users ON DELETE CASCADE,
  permissions TEXT DEFAULT 'view_only', -- 'view_only', 'view_log', 'full_access'
  PRIMARY KEY (caregiver_id, patient_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_patient_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Symptom logs policies
CREATE POLICY "Patients can manage their own logs" ON public.symptom_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Caregivers can view patient logs" ON public.symptom_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.caregiver_patient_links
      WHERE caregiver_id = auth.uid() AND patient_id = public.symptom_logs.user_id
    )
  );

-- Caregiver links policies
CREATE POLICY "Caregivers can view their links" ON public.caregiver_patient_links
  FOR SELECT USING (caregiver_id = auth.uid());

CREATE POLICY "Patients can view their links" ON public.caregiver_patient_links
  FOR SELECT USING (patient_id = auth.uid());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON public.symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_logged ON public.symptom_logs(user_id, logged_at DESC);

-- SEED DATA (Optional: You would typically run this via a seed script or SQL editor, not always in schema definition)
-- But for reference, we expect these roles to be manually assignable or handled via triggers.
-- For now, we keep the schema clean. Demo users will be handled in Frontend logic or manual DB insertion for MVP.
