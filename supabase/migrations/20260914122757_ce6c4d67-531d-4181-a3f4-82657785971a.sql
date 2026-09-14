ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS conteudo_pronto boolean NOT NULL DEFAULT false;

UPDATE public.projetos SET conteudo_pronto = true WHERE publicado = true;

DROP POLICY IF EXISTS "public read published projetos" ON public.projetos;
CREATE POLICY "public read published projetos" ON public.projetos
FOR SELECT USING (((publicado = true) AND (conteudo_pronto = true)) OR has_role(auth.uid(), 'admin'::app_role));