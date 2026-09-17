import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "./useSettings";

const countReady = async (table: string, extra?: (q: any) => any) => {
  let q: any = (supabase as any).from(table).select("id", { count: "exact", head: true }).eq("conteudo_pronto", true);
  if (extra) q = extra(q);
  const { count } = await q;
  return count ?? 0;
};

/** Quais seções têm conteúdo pronto e portanto podem aparecer no menu / site */
export const useNavSections = () => {
  const { data: s } = useSettings();

  const { data: counts } = useQuery({
    queryKey: ["nav_sections"],
    queryFn: async () => ({
      projetos: await countReady("projetos", (q: any) => q.eq("publicado", true)),
      voluntariados: await countReady("voluntariados"),
      skills: await countReady("skills", (q: any) => q.eq("visivel", true)),
    }),
    staleTime: 30_000,
  });

  const blocos = Array.isArray(s?.sobre_blocos) ? s!.sobre_blocos! : [];

  return {
    sobre: (s?.sobre_pronto ?? true) && (blocos.length > 0 || !!s?.sobre_hero),
    projetos: (counts?.projetos ?? 0) > 0,
    skills: (counts?.skills ?? 0) > 0,
    atuacaoSocial: (counts?.voluntariados ?? 0) > 0,
    contato: true,
  };
};
