GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

GRANT SELECT ON public.projetos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projetos TO authenticated;
GRANT ALL ON public.projetos TO service_role;

GRANT SELECT ON public.formacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formacoes TO authenticated;
GRANT ALL ON public.formacoes TO service_role;

GRANT SELECT ON public.experiencias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiencias TO authenticated;
GRANT ALL ON public.experiencias TO service_role;

GRANT SELECT ON public.voluntariados TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voluntariados TO authenticated;
GRANT ALL ON public.voluntariados TO service_role;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;