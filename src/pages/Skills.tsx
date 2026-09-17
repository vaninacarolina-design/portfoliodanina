import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { useSettings } from "@/hooks/useSettings";

type Skill = { id: string; nome: string; categoria: string; logo_url: string | null; ordem: number };

const Skills = () => {
  const { data: s } = useSettings();
  const h = s?.page_headers?.["skills"] || {};

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills_page"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("skills").select("*")
        .eq("visivel", true).eq("conteudo_pronto", true)
        .order("ordem", { ascending: true }).order("created_at", { ascending: true });
      return (data ?? []) as Skill[];
    },
  });

  const categorias = skills.reduce<Record<string, Skill[]>>((acc, sk) => {
    const key = (sk.categoria || "Outros").trim();
    (acc[key] ||= []).push(sk);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Skills · Vanina Maciel</title>
        <meta name="description" content="Habilidades, ferramentas e idiomas: softwares, gestão e comunicação." />
      </Helmet>

      <section className="container-editorial pt-24 pb-12">
        <Reveal>
          <RichText html={h.eyebrow || "— Habilidades"} className="text-eyebrow mb-6 block" />
          <RichText as="h1" html={h.titulo || "Skills &amp; <em class='italic font-light'>ferramentas</em>"} className="text-display-xl block" />
          <RichText
            html={h.subtitulo || s?.skills_intro || "Um panorama das ferramentas, competências de gestão e idiomas que uso no dia a dia."}
            className="mt-8 max-w-2xl text-lg text-foreground/70 leading-relaxed block" />
        </Reveal>
      </section>

      <section className="container-editorial pb-32">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && skills.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">Em breve.</div>
        )}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 items-start">
          {Object.entries(categorias).map(([cat, itens], i) => (
            <Reveal key={cat} delay={i * 0.07}>
              <div className="rounded-3xl bg-secondary/50 border border-border/60 p-7 md:p-8 h-full">
                <h2 className="font-display text-2xl mb-1">{cat}</h2>
                <div className="h-px w-10 bg-accent mb-6" />
                <ul className="space-y-3">
                  {itens.map(sk => (
                    <li key={sk.id}
                      className="flex items-center gap-3 justify-center text-center rounded-full bg-background border border-border/60 px-5 py-3 text-sm md:text-base transition-colors hover:border-accent">
                      {sk.logo_url && (
                        <img src={sk.logo_url} alt="" loading="lazy" className="w-5 h-5 object-contain shrink-0" />
                      )}
                      <RichText html={sk.nome} />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

export default Skills;
