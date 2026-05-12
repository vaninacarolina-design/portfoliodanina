ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS sobre_blocos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sobre_hero jsonb;