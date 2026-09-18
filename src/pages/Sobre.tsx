import { Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/useSettings";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { EditorialImg, EditorialGrid } from "@/components/site/EditorialImage";
import { SocialIcons } from "@/components/site/SocialIcons";

type Bloco =
  | { id?: string; tipo: "texto"; html: string; align?: "left" | "center" }
  | { id?: string; tipo: "frase"; html: string }
  | { id?: string; tipo: "imagem"; img: any; legenda?: string }
  | { id?: string; tipo: "par"; lado: "esquerda" | "direita"; img: any; html: string }
  | { id?: string; tipo: "galeria"; itens: any[] }
  | { id?: string; tipo: "espaco"; altura?: "s" | "m" | "l" }
  | { id?: string; tipo: "redes"; itens: { plataforma: string; url: string }[]; align?: "left" | "center" | "right" };

const SPACERS = { s: "h-12", m: "h-24", l: "h-40" };

const Sobre = () => {
  const { data: s, isLoading } = useSettings();
  const blocos: Bloco[] = Array.isArray(s?.sobre_blocos) ? (s!.sobre_blocos as any) : [];
  const hero = s?.sobre_hero;
  const h = s?.page_headers?.["sobre"] || {};
  const pronto = (s as any)?.sobre_pronto ?? true;

  if (!isLoading && !pronto) {
    return (
      <section className="container-editorial py-40 text-center">
        <p className="text-eyebrow mb-4">— Sobre mim</p>
        <h1 className="font-display text-4xl">Em breve.</h1>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sobre Mim · {(s?.hero_name || "Vanina Carolina").replace(/<[^>]+>/g, "")}</title>
        <meta name="description" content="Sobre Vanina — trajetória, valores e processo." />
      </Helmet>

      {/* Hero */}
      <section className="container-editorial pt-24 pb-16">
        <Reveal>
          <RichText html={h.eyebrow || "— Sobre mim"} className="text-eyebrow mb-6 block" />
          <RichText as="h1" html={h.titulo || `Olá, eu sou<br/><em class='italic font-light'>${s?.hero_name || "Vanina"}</em>`} className="text-display-xl block" />
          {h.subtitulo && <RichText html={h.subtitulo} className="mt-8 max-w-2xl text-lg text-foreground/70 leading-relaxed block" />}
        </Reveal>
        {hero?.url && (
          <Reveal delay={0.2} className="mt-16">
            <EditorialImg item={hero} alt="" className="w-full" natural={hero.ratio === "auto"} />
          </Reveal>
        )}
      </section>

      <section className="container-editorial pb-40">
        {isLoading && <div className="text-muted-foreground">Carregando…</div>}
        {!isLoading && blocos.length === 0 && (
          <div className="py-24 text-center text-muted-foreground italic">
            Conteúdo em construção. Adicione blocos editoriais no admin.
          </div>
        )}

        <div className="space-y-24 md:space-y-32">
          {blocos.map((b, i) => (
            <Reveal key={(b as any).id || i}>
              {b.tipo === "texto" && (
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-2 hidden md:block" />
                  <div className={`md:col-span-8 prose-editorial ${b.align === "center" ? "text-center" : ""}`}
                    dangerouslySetInnerHTML={{ __html: b.html }} />
                </div>
              )}
              {b.tipo === "frase" && (
                <blockquote className="max-w-5xl mx-auto py-12 text-center">
                  <RichText html={b.html} as="p"
                    className="font-display text-4xl md:text-7xl italic font-light leading-[1.05] text-foreground" />
                </blockquote>
              )}
              {b.tipo === "imagem" && (
                <figure className="space-y-3">
                  <EditorialImg item={b.img} alt={b.legenda || ""} className="w-full" natural={!b.img?.ratio || b.img?.ratio === "auto"} />
                  {b.legenda && <figcaption className="text-xs text-muted-foreground text-center italic">{b.legenda}</figcaption>}
                </figure>
              )}
              {b.tipo === "par" && (
                <div className={`grid md:grid-cols-12 gap-8 md:gap-12 items-center ${b.lado === "direita" ? "md:[direction:rtl]" : ""}`}>
                  <div className="md:col-span-5 [direction:ltr]">
                    <EditorialImg item={b.img} alt="" className="w-full" />
                  </div>
                  <div className="md:col-span-6 md:col-start-7 [direction:ltr]">
                    <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: b.html }} />
                  </div>
                </div>
              )}
              {b.tipo === "galeria" && <EditorialGrid items={b.itens || []} />}
              {b.tipo === "espaco" && <div className={SPACERS[b.altura || "m"]} />}
              {b.tipo === "redes" && <SocialIcons itens={b.itens || []} align={b.align || "center"} />}
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

export default Sobre;
