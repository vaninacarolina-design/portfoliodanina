import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { EditorialGrid } from "@/components/site/EditorialImage";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const ProjetoDetalhe = () => {
  const { slug } = useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["projeto", slug],
    queryFn: async () => {
      const { data } = await supabase.from("projetos").select("*").eq("slug", slug!).eq("publicado", true).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="container-editorial py-32 text-muted-foreground">Carregando…</div>;
  if (!p) return <Navigate to="/projetos" replace />;

  const galeria: any[] = Array.isArray(p.galeria) ? p.galeria : [];

  const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)?.[1];
  const vimeoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1];
  const stripHtml = (v: any) => typeof v === "string" ? v.replace(/<[^>]+>/g, "").trim() : "";

  return (
    <>
      <Helmet>
        <title>{stripHtml(p.titulo) || "Projeto"} · Vanina Carolina</title>
        <meta name="description" content={stripHtml(p.descricao_curta) || stripHtml(p.subtitulo)} />
      </Helmet>

      <article>
        <header className="container-editorial pt-16 pb-16">
          <Link to="/projetos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12">
            <ArrowLeft size={16} /> Todos os projetos
          </Link>
          <Reveal>
            {p.categoria && <RichText html={p.categoria} className="text-eyebrow mb-6 block" />}
            <RichText as="h1" html={p.titulo} className="text-display-xl mb-6" />
            {p.subtitulo && <RichText html={p.subtitulo} className="text-display-md font-light text-foreground/70 max-w-3xl block" />}
          </Reveal>
        </header>

        {p.cover_url && (
          <Reveal>
            <div className="w-full aspect-[16/9] overflow-hidden bg-secondary">
              <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        )}

        <section className="container-editorial py-20 grid md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-4">
            <dl className="space-y-6 text-sm">
              {p.cliente && <Meta label="Cliente"><RichText html={p.cliente} /></Meta>}
              {p.papel && <Meta label="Papel"><RichText html={p.papel} /></Meta>}
              {p.periodo && <Meta label="Período"><RichText html={p.periodo} /></Meta>}
              {p.categoria && <Meta label="Categoria"><RichText html={p.categoria} /></Meta>}
            </dl>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-8">
            {p.descricao_curta && <div className="text-xl md:text-2xl font-display mb-10 leading-snug prose-editorial" dangerouslySetInnerHTML={{ __html: p.descricao_curta }} />}
            {p.conteudo && <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: p.conteudo }} />}
          </Reveal>
        </section>

        {p.video_url && (
          <Reveal>
            <div className="container-editorial pb-20">
              <div className="aspect-video w-full bg-black">
                {youtubeId(p.video_url) ? (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId(p.video_url)}`} allowFullScreen title="vídeo" />
                ) : vimeoId(p.video_url) ? (
                  <iframe className="w-full h-full" src={`https://player.vimeo.com/video/${vimeoId(p.video_url)}`} allowFullScreen title="vídeo" />
                ) : (
                  <video src={p.video_url} controls className="w-full h-full" />
                )}
              </div>
            </div>
          </Reveal>
        )}

        {galeria.length > 0 && (
          <section className="container-editorial pb-32">
            <EditorialGrid items={galeria} alt={stripHtml(p.titulo)} />
          </section>
        )}

        <section className="container-editorial pb-32 border-t border-border pt-16">
          <Link to="/projetos" className="inline-flex items-center gap-3 font-display text-2xl hover-underline">
            Próximos projetos <ArrowUpRight />
          </Link>
        </section>
      </article>
    </>
  );
};

const Meta = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-eyebrow mb-1">{label}</dt>
    <dd className="text-foreground">{children}</dd>
  </div>
);

export default ProjetoDetalhe;
