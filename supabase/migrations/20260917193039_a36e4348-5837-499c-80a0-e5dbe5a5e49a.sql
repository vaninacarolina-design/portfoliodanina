CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'Softwares',
  logo_url text,
  nivel text,
  ordem integer NOT NULL DEFAULT 0,
  visivel boolean NOT NULL DEFAULT true,
  conteudo_pronto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read skills" ON public.skills FOR SELECT
USING ((visivel = true AND conteudo_pronto = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin write skills" ON public.skills FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_skills_updated BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS sobre_pronto boolean NOT NULL DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS skills_intro text NOT NULL DEFAULT '';