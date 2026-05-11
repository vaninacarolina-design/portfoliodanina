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

      <section className="container-editorial pb-32">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && voluntariados.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">
            Em breve, novos relatos.
          </div>
        )}

        <div className="space-y-24">
          {voluntariados.map((v: any, i: number) => (
            <Reveal key={v.id} delay={i * 0.05}>
              <article className="grid md:grid-cols-12 gap-8 md:gap-12 items-start border-t border-border pt-12">
                <div className="md:col-span-4">
                  <div className="text-eyebrow mb-3">{v.periodo}</div>
                  <h2 className="font-display text-3xl md:text-4xl leading-tight">
                    {v.titulo}
                  </h2>
                  <div className="mt-2 text-foreground/70">{v.organizacao}</div>
                </div>
                <div className="md:col-span-8 text-base md:text-lg text-foreground/80 leading-relaxed">
                  {v.descricao}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

export default AtuacaoSocial;
