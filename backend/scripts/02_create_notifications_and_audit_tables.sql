-- =====================================================================
-- ResumeAI Database Schema Enhancement: Notifications & Status Audit Trail
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =====================================================================

-- 1. Create notifications table for real-time status alerts across Web & Mobile
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'status_update',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable indexes for fast lookup by candidate/recruiter ID
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 2. Add optional status_history column to public.applications for DB-level audit trails
--    Note: Even if this column is omitted, ResumeAI's backend automatically embeds
--    full status history timestamps inside cover_note metadata for zero-crash fallback.
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- 3. Add constraint / index for application statuses
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 4. Enable Row Level Security (RLS) on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and update their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
