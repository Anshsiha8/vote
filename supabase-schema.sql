-- =========================================================
-- CAMPUS VOTE: SUPABASE POSTGRESQL SCHEMA & REALTIME SETUP
-- Completely usable with ₹0 budget on Supabase Free Tier
-- =========================================================

-- 1. Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('yes_no', 'multiple_choice', 'rating')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    join_code VARCHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create responses table
CREATE TABLE IF NOT EXISTS public.responses (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_id TEXT REFERENCES public.poll_options(id) ON DELETE SET NULL,
    rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
    participant_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Prevent duplicate voting at database level
    CONSTRAINT unique_poll_participant UNIQUE (poll_id, participant_id)
);

-- 4. Create Indexes for instant retrieval
CREATE INDEX IF NOT EXISTS idx_polls_join_code ON public.polls(join_code);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON public.responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_participant_poll ON public.responses(poll_id, participant_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Allow public read access to polls
CREATE POLICY "Public read polls" ON public.polls
    FOR SELECT USING (true);

-- Allow public read access to poll options
CREATE POLICY "Public read poll_options" ON public.poll_options
    FOR SELECT USING (true);

-- Allow creation and updates of polls (Host / Public token)
CREATE POLICY "Public manage polls" ON public.polls
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public manage options" ON public.poll_options
    FOR ALL USING (true) WITH CHECK (true);

-- Allow reading responses for live results
CREATE POLICY "Public read responses" ON public.responses
    FOR SELECT USING (true);

-- Allow students to submit responses for active polls
CREATE POLICY "Students submit responses" ON public.responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls
            WHERE public.polls.id = responses.poll_id
            AND public.polls.status = 'active'
        )
    );

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
