
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Site settings (singleton-ish: hero, sobre, contato)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_name TEXT NOT NULL DEFAULT 'Vanina Carolina',
  hero_subtitle TEXT NOT NULL DEFAULT 'Profissional multidisciplinar',
  hero_intro TEXT NOT NULL DEFAULT 'Texto de apresentação',
  hero_image_url TEXT,
  about_text TEXT NOT NULL DEFAULT '',
  contact_intro TEXT NOT NULL DEFAULT 'Vamos conversar.',
  whatsapp_number TEXT NOT NULL DEFAULT '5541999288087',
  whatsapp_display TEXT NOT NULL DEFAULT '(41) 99928-8087',
  email TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  social_behance TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.site_settings (hero_intro, about_text) VALUES (
  'Designer e estrategista com trajetória multidisciplinar, conectando criatividade, gestão e impacto social.',
  'Apresentação detalhada sobre minha trajetória.'
);

-- Formações
CREATE TABLE public.formacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  periodo TEXT,
  descricao TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.formacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read formacoes" ON public.formacoes FOR SELECT USING (true);
CREATE POLICY "admin write formacoes" ON public.formacoes FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- Experiências
CREATE TABLE public.experiencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo TEXT NOT NULL,
  empresa TEXT NOT NULL,
  periodo TEXT,
  descricao TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experiencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read experiencias" ON public.experiencias FOR SELECT USING (true);
CREATE POLICY "admin write experiencias" ON public.experiencias FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- Voluntariado
CREATE TABLE public.voluntariados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  organizacao TEXT NOT NULL,
  periodo TEXT,
  descricao TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.voluntariados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read voluntariados" ON public.voluntariados FOR SELECT USING (true);
CREATE POLICY "admin write voluntariados" ON public.voluntariados FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- Projetos
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  categoria TEXT,
  descricao_curta TEXT,
  conteudo TEXT, -- HTML do tiptap
  cover_url TEXT,
  video_url TEXT,
  galeria JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de URLs
  cliente TEXT,
  papel TEXT,
  periodo TEXT,
  publicado BOOLEAN NOT NULL DEFAULT false,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published projetos" ON public.projetos FOR SELECT USING (publicado = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write projetos" ON public.projetos FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_projetos_updated BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket público para mídia
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "admin upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

-- Auto criar role admin para o email da Vanina ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'vaninacarolina@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
