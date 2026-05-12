import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { EditorialGrid } from "@/components/site/EditorialImage";

const AtuacaoSocial = () => {
  const { data: voluntariados = [], isLoading } = useQuery({
    queryKey: ["voluntariados_page"],
    queryFn: async () =>
      (await supabase.from("voluntariados").select("*").order("ordem")).data ?? [],
  });

  return (
    <>
      <Helmet>
        <title>Atuação Social · Vanina Carolina</title>
        <meta name="description" content="Iniciativas, voluntariado e projetos de impacto social." />
      </Helmet>

      <section className="container-editorial pt-24 pb-16">
        <Reveal>
          <div className="text-eyebrow mb-6">— Impacto</div>
          <h1 className="text-display-xl">
            Atuação <em className="italic font-light">social</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-foreground/75 leading-relaxed">
            Causas, comunidades e iniciativas que carrego comigo.
          </p>
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
                  <div className="md:col-span-4">
                    <RichText html={v.periodo} className="text-eyebrow mb-3" />
                    <RichText as="h2" html={v.titulo} className="font-display text-3xl md:text-5xl leading-[1.05]" />
                    <RichText html={v.organizacao} className="mt-3 text-foreground/70" />
                  </div>
                  <div className="md:col-span-8 text-base md:text-lg text-foreground/80 leading-relaxed">
                    {v.descricao}
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
