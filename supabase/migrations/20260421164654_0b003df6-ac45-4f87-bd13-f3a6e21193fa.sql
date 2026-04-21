
-- Fix search_path nas funções
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Bucket: remover listing aberto. Como bucket é público, URLs diretas funcionam mesmo sem SELECT policy.
DROP POLICY IF EXISTS "public read media" ON storage.objects;
-- Admin pode listar/ler tudo
CREATE POLICY "admin read media" ON storage.objects FOR SELECT USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
