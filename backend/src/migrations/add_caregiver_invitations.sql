-- Migration: Add Caregiver Invitation System
-- Date: 2026-02-12
-- Description: Creates the caregiver_invitations table and updates caregiver_assignments

-- Create caregiver_invitations table
CREATE TABLE IF NOT EXISTS caregiver_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    personal_message TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    
    -- Prevent duplicate pending invitations for same email from same patient
    CONSTRAINT unique_pending_invitation UNIQUE (patient_id, invitee_email, status)
);

-- Add indexes for performance
CREATE INDEX idx_invitation_token ON caregiver_invitations(invitation_token);
CREATE INDEX idx_invitation_patient ON caregiver_invitations(patient_id);
CREATE INDEX idx_invitation_status ON caregiver_invitations(status);
CREATE INDEX idx_invitation_expires ON caregiver_invitations(expires_at);

-- Update caregiver_assignments table to track invitation source
ALTER TABLE caregiver_assignments 
ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES caregiver_invitations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assignment_invitation ON caregiver_assignments(invitation_id);

-- Comments for documentation
COMMENT ON TABLE caregiver_invitations IS 'Stores caregiver invitations sent by patients';
COMMENT ON COLUMN caregiver_invitations.patient_id IS 'The patient who sent the invitation';
COMMENT ON COLUMN caregiver_invitations.invitee_email IS 'Email address of the invited caregiver';
COMMENT ON COLUMN caregiver_invitations.invitation_token IS 'Unique token for invitation link';
COMMENT ON COLUMN caregiver_invitations.status IS 'Status: pending, accepted, expired, cancelled';
COMMENT ON COLUMN caregiver_invitations.expires_at IS 'Expiration timestamp (7 days from creation)';
