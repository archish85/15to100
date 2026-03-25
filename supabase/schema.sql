-- Create tables for 15 to 100

-- Question Table
CREATE TABLE IF NOT EXISTS public.questions (
    question_id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL, -- 'Purple', 'Orange', 'Yellow'
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    answer INTEGER NOT NULL, -- Index of the correct answer (0-3)
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    asked_status BOOLEAN DEFAULT FALSE,
    asked_count INTEGER DEFAULT 0,
    expiry_status BOOLEAN DEFAULT FALSE,
    source TEXT,
    submitted_by TEXT,
    corrected_date DATE,
    corrected_by TEXT
);

-- User Table
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played TIMESTAMP WITH TIME ZONE,
    win_record INTEGER DEFAULT 0
);

-- Response Table
CREATE TABLE IF NOT EXISTS public.responses (
    index SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(user_id),
    question_id INTEGER REFERENCES public.questions(question_id),
    date_asked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_answered_correctly BOOLEAN
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_asked_status ON public.questions(asked_status);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON public.responses(user_id);

-- RLS Policies (Enable RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Policies (Simple public access for now, can be refined)
-- Allow read access to questions for everyone (or authenticated users if using auth)
CREATE POLICY "Allow public read access" ON public.questions FOR SELECT USING (true);

-- Allow insert/update on users and responses (needs refinement based on auth model)
-- For this game, we might be using anonymous auth or just client-side UUIDs.
-- If using client-side UUIDs without Supabase Auth, we need to be careful.
-- Assuming we use Supabase Anon Key, we can allow operations.

CREATE POLICY "Allow public insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public select" ON public.users FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.responses FOR SELECT USING (true);

-- Add image_url to questions table if not exists (Idempotent check not strictly needed for schema.sql as it defines the base state, but good for migrations)
-- Ideally this is a migration, but for this project structure we append to schema.
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
