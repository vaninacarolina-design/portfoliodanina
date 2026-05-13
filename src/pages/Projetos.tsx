import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { useSettings } from "@/hooks/useSettings";

const Projetos = () => {
  const { data: projetos = [], isLoading } = useQuery({
    queryKey: ["projetos_all"],
    queryFn: async () => (await supabase.from("projetos").select("*").eq("publicado", true).order("ordem")).data ?? [],
  });
  const { data: settings } = useSettings();
  const h = settings?.page_headers?.["projetos"] || {};

  return (
    <>
      <Helmet><title>Projetos · Vanina Carolina</title></Helmet>
      <section className="container-editorial pt-24 pb-12">
        <Reveal>
          <RichText html={h.eyebrow || "— Portfólio"} className="text-eyebrow mb-6 block" />
          <RichText as="h1" html={h.titulo || "Projetos"} className="text-display-xl block" />
          <RichText html={h.subtitulo || "Uma seleção de trabalhos, colaborações e iniciativas."} className="mt-8 max-w-2xl text-lg text-foreground/70 leading-relaxed block" />
        </Reveal>
      </section>

      <section className="container-editorial pb-32">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && projetos.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">Em breve novos projetos.</div>
        )}

        {/* Grid editorial 12-col com offset alternado para respiro */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-24">
          {projetos.map((p: any, i) => {
            // padrão editorial: alterna 5/5/2 — esquerda larga, direita média deslocada
            const positions = [
              "md:col-span-7",
              "md:col-span-5 md:mt-32",
              "md:col-span-5 md:col-start-2",
              "md:col-span-6 md:col-start-7 md:mt-20",
              "md:col-span-8 md:col-start-3",
            ];
            const cls = positions[i % positions.length];
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.08} className={cls}>
                <Link to={`/projetos/${p.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary mb-8 relative">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                    ) : <div className="w-full h-full" />}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-3">
                      {p.categoria && <RichText html={p.categoria} className="text-eyebrow block" />}
                      <RichText as="h2" html={p.titulo} className="font-display text-2xl md:text-[2rem] leading-[1.15] tracking-tight" />
                      {p.subtitulo && <RichText html={p.subtitulo} className="text-base text-foreground/65 leading-relaxed max-w-md block" />}
                    </div>
                    <ArrowUpRight className="mt-2 shrink-0 transition-transform group-hover:rotate-45" size={22} />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
};
export default Projetos;
