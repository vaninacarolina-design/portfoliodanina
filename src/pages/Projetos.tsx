import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const Projetos = () => {
  const { data: projetos = [], isLoading } = useQuery({
    queryKey: ["projetos_all"],
    queryFn: async () => (await supabase.from("projetos").select("*").eq("publicado", true).order("ordem")).data ?? [],
  });

  return (
    <>
      <Helmet><title>Projetos · Vanina Carolina</title></Helmet>
      <section className="container-editorial pt-20 pb-16">
        <Reveal>
          <div className="text-eyebrow mb-6">— Portfólio</div>
          <h1 className="text-display-xl">Projetos</h1>
          <p className="mt-8 max-w-2xl text-lg text-foreground/70">Uma seleção de trabalhos, colaborações e iniciativas.</p>
        </Reveal>
      </section>

      <section className="container-editorial pb-32">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && projetos.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">Em breve novos projetos.</div>
        )}

        {/* Grid uniforme — fileira de imagens clicáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projetos.map((p: any, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <Link to={`/projetos/${p.slug}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-secondary mb-4 relative">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.titulo} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                  ) : <div className="w-full h-full" />}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {p.categoria && <div className="text-eyebrow mb-1.5">{p.categoria}</div>}
                    <h2 className="font-display text-xl md:text-2xl leading-tight truncate">{p.titulo}</h2>
                    {p.subtitulo && <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{p.subtitulo}</p>}
                  </div>
                  <ArrowUpRight className="mt-1 shrink-0 transition-transform group-hover:rotate-45" size={20} />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};
export default Projetos;
