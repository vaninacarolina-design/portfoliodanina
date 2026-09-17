import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { EditorialGrid } from "@/components/site/EditorialImage";
import { useSettings } from "@/hooks/useSettings";
import { ArrowUpRight } from "lucide-react";

const AtuacaoSocial = () => {
  const { data: voluntariados = [], isLoading } = useQuery({
    queryKey: ["voluntariados_page"],
    queryFn: async () =>
      (await supabase.from("voluntariados").select("*").eq("conteudo_pronto", true).order("ordem")).data ?? [],
  });
  const { data: settings } = useSettings();
  const h = settings?.page_headers?.["atuacao-social"] || {};

  return (
    <>
      <Helmet>
        <title>Atuação Social · Vanina Carolina</title>
        <meta name="description" content="Iniciativas, voluntariado e projetos de impacto social." />
      </Helmet>

      <section className="container-editorial pt-24 pb-16">
        <Reveal>
          <RichText html={h.eyebrow || "— Impacto"} className="text-eyebrow mb-6 block" />
          <RichText as="h1" html={h.titulo || "Atuação <em>social</em>"} className="text-display-xl block" />
          <RichText html={h.subtitulo || "Causas, comunidades e iniciativas que carrego comigo."} className="mt-8 max-w-2xl text-lg text-foreground/75 leading-relaxed block" />
        </Reveal>
      </section>

      <section className="container-editorial pb-32 space-y-40">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && voluntariados.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">Em breve, novos relatos.</div>
        )}

        {voluntariados.map((v: any) => {
          const galeria: any[] = Array.isArray(v.galeria) ? v.galeria : [];
          return (
            <Reveal key={v.id}>
              <article className="border-t border-border pt-16 space-y-16">
                <header className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-4 space-y-3">
                    <RichText html={v.periodo} className="text-eyebrow block" />
                    <RichText as="h2" html={v.titulo} className="font-display text-3xl md:text-5xl leading-[1.1] block" />
                    <RichText html={v.organizacao} className="text-foreground/70 block" />
                  </div>
                  <div className="md:col-span-8 space-y-6">
                    <div className="text-base md:text-lg text-foreground/80 leading-relaxed">
                      {v.descricao}
                    </div>
                    {v.link_url && (
                      <a href={v.link_url} target="_blank" rel="noreferrer noopener"
                        className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 hover:bg-secondary text-foreground/80 hover:text-foreground transition-colors px-5 py-2.5 text-sm tracking-wide">
                        Saiba mais
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                </header>

                {v.cover_url && (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-secondary">
                    <img src={v.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}

                {v.destaque && (
                  <blockquote className="max-w-4xl mx-auto py-8 text-center">
                    <RichText html={v.destaque} as="p" className="font-display text-3xl md:text-5xl italic font-light leading-tight text-foreground/90" />
                  </blockquote>
                )}

                {v.conteudo && (
                  <div className="grid md:grid-cols-12 gap-8">
                    <div className="md:col-span-2 hidden md:block" />
                    <div className="md:col-span-8 prose-editorial" dangerouslySetInnerHTML={{ __html: v.conteudo }} />
                  </div>
                )}

                {galeria.length > 0 && <EditorialGrid items={galeria} alt={typeof v.titulo === "string" ? v.titulo : ""} />}
              </article>
            </Reveal>
          );
        })}
      </section>
    </>
  );
};

export default AtuacaoSocial;
