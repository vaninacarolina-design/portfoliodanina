import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  hero_name: string;
  hero_subtitle: string;
  hero_intro: string;
  hero_image_url: string | null;
  about_text: string;
  contact_intro: string;
  whatsapp_number: string;
  whatsapp_display: string;
  email: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_behance: string | null;
  marquee_palavras: string[] | null;
  sobre_blocos: any[] | null;
  sobre_hero: any | null;
  page_headers: Record<string, { eyebrow?: string; titulo?: string; subtitulo?: string }> | null;
  sobre_pronto?: boolean | null;
  skills_intro?: string | null;
};

export const useSettings = () => useQuery({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data as unknown as SiteSettings | null;
  },
});
