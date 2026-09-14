ALTER TABLE public.formacoes ADD COLUMN IF NOT EXISTS conteudo_pronto boolean NOT NULL DEFAULT false;
ALTER TABLE public.experiencias ADD COLUMN IF NOT EXISTS conteudo_pronto boolean NOT NULL DEFAULT false;
ALTER TABLE public.voluntariados ADD COLUMN IF NOT EXISTS conteudo_pronto boolean NOT NULL DEFAULT false;

UPDATE public.formacoes SET conteudo_pronto = true;
UPDATE public.experiencias SET conteudo_pronto = true;
UPDATE public.voluntariados SET conteudo_pronto = true;

DROP POLICY IF EXISTS "public read formacoes" ON public.formacoes;
CREATE POLICY "public read formacoes" ON public.formacoes FOR SELECT
USING (conteudo_pronto = true OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "public read experiencias" ON public.experiencias;
CREATE POLICY "public read experiencias" ON public.experiencias FOR SELECT
USING (conteudo_pronto = true OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "public read voluntariados" ON public.voluntariados;
CREATE POLICY "public read voluntariados" ON public.voluntariados FOR SELECT
USING (conteudo_pronto = true OR has_role(auth.uid(), 'admin'::app_role));