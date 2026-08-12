import { createClient } from "@supabase/supabase-js";

// Read environment variables (from .env or .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL" &&
  supabaseAnonKey && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/*
  =============================================================================
  SUPABASE DATABASE SCHEMA (Run this SQL script in your Supabase SQL Editor):
  =============================================================================

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    cycle_id TEXT DEFAULT 'cycle-2',
    labels JSONB DEFAULT '[]'::jsonb,
    assignee JSONB NOT NULL,
    due_date DATE,
    estimated_hours NUMERIC DEFAULT 0,
    attachments INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    checklist JSONB DEFAULT '[]'::jsonb,
    comment_list JSONB DEFAULT '[]'::jsonb,
    activity_log JSONB DEFAULT '[]'::jsonb,
    linked_tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Grant all privileges on the tasks table to anonymous and authenticated users for simple demo access:
  GRANT ALL ON public.tasks TO anon, authenticated;

  -- Enable Row Level Security (RLS) and allow public access for demo:
  ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow public read/write access" ON tasks FOR ALL USING (true) WITH CHECK (true);

  -- Enable Realtime replication for the tasks table:
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
*/
