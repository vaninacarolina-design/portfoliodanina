
ALTER TABLE public.formacoes
  ADD COLUMN IF NOT EXISTS data_conclusao date,
  ADD COLUMN IF NOT EXISTS anexos jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS marquee_palavras jsonb NOT NULL DEFAULT '["Estratégia","Criatividade","Gestão","Impacto","Design"]'::jsonb;
