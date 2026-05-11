ALTER TABLE public.voluntariados
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS galeria jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS conteudo text,
  ADD COLUMN IF NOT EXISTS destaque text;

CREATE UNIQUE INDEX IF NOT EXISTS voluntariados_slug_unique
  ON public.voluntariados (slug) WHERE slug IS NOT NULL;

ALTER TABLE public.projetos
  ADD COLUMN IF NOT EXISTS blocos jsonb NOT NULL DEFAULT '[]'::jsonb;