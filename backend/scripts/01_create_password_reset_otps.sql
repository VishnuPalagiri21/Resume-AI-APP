-- ==============================================================================
-- ResumeAI • Supabase PostgreSQL Schema Migration
-- Table: public.password_reset_otps
-- Description: Stores hashed One-Time Passwords (OTPs) for the Forgot Password
--              email verification workflow.
-- ==============================================================================

-- 1. Create table for OTP reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  otp_hash   text        NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts   integer     NOT NULL DEFAULT 0,
  verified   boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create performance indices on email lookup & expiry filtering
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.password_reset_otps(expires_at);

-- 3. Disable Row Level Security (server-side only table managed by service_role key)
ALTER TABLE public.password_reset_otps DISABLE ROW LEVEL SECURITY;
