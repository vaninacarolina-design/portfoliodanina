import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";

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
        <meta
          name="description"
          content="Iniciativas, voluntariado e projetos de impacto social."
        />
      </Helmet>

      <section className="container-editorial pt-24 pb-16">
        <Reveal>
          <div className="text-eyebrow mb-6">— Impacto</div>
          <h1 className="text-display-xl">
            Atuação <em className="italic font-light">social</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-foreground/75 leading-relaxed">
            Causas, comunidades e iniciativas que carrego comigo. Espaço para
            relatos, fotos e aprendizados.
          </p>
        </Reveal>
      </section>

      <section className="container-editorial pb-32 space-y-32">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && voluntariados.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">
            Em breve, novos relatos.
          </div>
        )}

        {voluntariados.map((v: any, i: number) => {
          const galeria: string[] = Array.isArray(v.galeria) ? v.galeria.filter((x: any) => typeof x === "string") : [];
          const flip = i % 2 === 1;
          return (
            <Reveal key={v.id} delay={0.05}>
              <article className="border-t border-border pt-12 space-y-12">
                {/* Header */}
                <header className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-4">
                    <div className="text-eyebrow mb-3">{v.periodo}</div>
                    <h2 className="font-display text-3xl md:text-5xl leading-[1.05]">{v.titulo}</h2>
                    <div className="mt-3 text-foreground/70">{v.organizacao}</div>
                  </div>
                  <div className="md:col-span-8 text-base md:text-lg text-foreground/80 leading-relaxed">
                    {v.descricao}
                  </div>
                </header>

                {/* Cover */}
                {v.cover_url && (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-secondary">
                    <img src={v.cover_url} alt={v.titulo} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Destaque (pull-quote) */}
                {v.destaque && (
                  <blockquote className="max-w-4xl mx-auto py-8 text-center">
                    <p className="font-display text-3xl md:text-5xl italic font-light leading-tight text-foreground/90">
                      "{v.destaque}"
                    </p>
                  </blockquote>
                )}

                {/* Conteúdo rico */}
                {v.conteudo && (
                  <div className={`grid md:grid-cols-12 gap-8 ${flip ? "" : ""}`}>
                    <div className="md:col-span-2 hidden md:block" />
                    <div className="md:col-span-8 prose-editorial" dangerouslySetInnerHTML={{ __html: v.conteudo }} />
                  </div>
                )}

                {/* Galeria livre */}
                {galeria.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {galeria.map((url, k) => (
                      <div key={k} className={`overflow-hidden bg-secondary ${k % 5 === 0 ? "col-span-2 md:row-span-2 aspect-square md:aspect-[4/5]" : "aspect-square"}`}>
                        <img src={url} alt={`${v.titulo} ${k + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </section>
    </>
  );
};

export default AtuacaoSocial;
