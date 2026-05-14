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

        {/* Grid editorial bento — tamanhos alternados, cantos arredondados, título sobre a imagem */}
        <div className="grid grid-cols-2 md:grid-cols-6 auto-rows-[140px] md:auto-rows-[180px] gap-3 md:gap-5">
          {projetos.map((p: any, i) => {
            // padrão bento de 6 colunas: tamanhos alternados para ritmo visual
            const layouts = [
              "col-span-2 md:col-span-4 row-span-2",        // grande paisagem
              "col-span-2 md:col-span-2 row-span-2",        // pequeno quadrado
              "col-span-2 md:col-span-2 row-span-3",        // alto retrato
              "col-span-2 md:col-span-4 row-span-3",        // grande retrato
              "col-span-2 md:col-span-3 row-span-2",        // médio
              "col-span-2 md:col-span-3 row-span-2",        // médio
            ];
            const cls = layouts[i % layouts.length];
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.06} className={cls}>
                <Link
                  to={`/projetos/${p.slug}`}
                  className="group relative block w-full h-full overflow-hidden rounded-2xl bg-secondary"
                >
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                    />
                  ) : <div className="absolute inset-0" />}

                  {/* gradiente para legibilidade do título */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent opacity-90" />

                  {/* metadados sobre a imagem */}
                  <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end text-background">
                    {p.categoria && (
                      <RichText
                        html={p.categoria}
                        className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-2 block"
                      />
                    )}
                    <RichText
                      as="h2"
                      html={p.titulo}
                      className="font-display text-lg md:text-2xl leading-[1.15] tracking-tight"
                    />
                    {p.subtitulo && (
                      <RichText
                        html={p.subtitulo}
                        className="mt-1 text-xs md:text-sm opacity-85 leading-snug line-clamp-2 block"
                      />
                    )}
                  </div>

                  {/* seta no canto */}
                  <div className="absolute top-4 right-4 bg-background/90 text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={16} />
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
