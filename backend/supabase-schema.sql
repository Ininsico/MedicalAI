-- Healthcare Management System Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'caregiver', 'patient')) NOT NULL DEFAULT 'patient',
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    contact_number TEXT NOT NULL,
    emergency_contact JSONB,
    address TEXT,
    medical_history TEXT,
    current_medications TEXT[],
    allergies TEXT[],
    doctor_name TEXT,
    doctor_contact TEXT,
    insurance_info TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id)
);

-- Caregiver assignments table
CREATE TABLE IF NOT EXISTS caregiver_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assignment_notes TEXT,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    assigned_date DATE DEFAULT CURRENT_DATE,
    ended_date DATE,
    ended_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'bad')) NOT NULL,
    symptoms TEXT[],
    medication_taken BOOLEAN DEFAULT false,
    medication_notes TEXT,
    food_intake TEXT,
    sleep_hours DECIMAL(3,1),
    activity_level TEXT CHECK (activity_level IN ('low', 'moderate', 'high')),
    tremor_severity INTEGER CHECK (tremor_severity BETWEEN 0 AND 10),
    stiffness_severity INTEGER CHECK (stiffness_severity BETWEEN 0 AND 10),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    action TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    target_id UUID,
    target_type TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_caregiver_assignments_status ON caregiver_assignments(status);
CREATE INDEX IF NOT EXISTS idx_caregiver_assignments_caregiver ON caregiver_assignments(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_assignments_patient ON caregiver_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_patient_date ON daily_logs(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create partial unique index for caregiver_assignments
-- This ensures one active assignment per patient-caregiver pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_assignment 
ON caregiver_assignments(patient_id, caregiver_id) 
WHERE status = 'active';

-- Create unique index for daily_logs
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_log 
ON daily_logs(patient_id, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for caregiver_assignments updated_at
CREATE TRIGGER update_caregiver_assignments_updated_at 
    BEFORE UPDATE ON caregiver_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();