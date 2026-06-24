-- Quiz Results Table untuk BeebaneLabs
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_slug text NOT NULL,
  quiz_id text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 5,
  percent numeric(5,2) NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_results_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT quiz_results_unique UNIQUE (user_id, article_slug, quiz_id)
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_article_slug ON public.quiz_results(article_slug);
CREATE INDEX IF NOT EXISTS idx_quiz_results_passed ON public.quiz_results(passed);

-- RLS Policy (Row Level Security)
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users bisa baca quiz results sendiri
CREATE POLICY "Users can read own quiz results"
  ON public.quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users bisa insert quiz results sendiri
CREATE POLICY "Users can insert own quiz results"
  ON public.quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users bisa update quiz results sendiri (untuk retry)
CREATE POLICY "Users can update own quiz results"
  ON public.quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.quiz_results IS 'Menyimpan hasil quiz dari setiap artikel yang dikerjakan user';
