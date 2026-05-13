ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS page_headers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.voluntariados ADD COLUMN IF NOT EXISTS link_url text;