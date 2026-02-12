-- Fix Migration: Allow multiple non-pending invitations
-- Date: 2026-02-12
-- Description: Drops the strict unique constraint and replaces it with a partial index

-- 1. Drop the overly restrictive constraint
ALTER TABLE caregiver_invitations
DROP CONSTRAINT IF EXISTS unique_pending_invitation;

-- 2. Create a unique index that ONLY applies to PENDING invitations
-- This allows multiple 'cancelled', 'expired', or 'accepted' records for the same email
CREATE UNIQUE INDEX idx_unique_pending_invitation 
ON caregiver_invitations (patient_id, invitee_email) 
WHERE status = 'pending';
