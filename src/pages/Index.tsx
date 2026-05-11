import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";

const scrollToNext = () => {
  const target = document.getElementById("apos-hero");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";
import { Reveal } from "@/components/site/Reveal";

const Index = () => {
  const { data: s } = useSettings();
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const { data: formacoes = [] } = useQuery({
    queryKey: ["formacoes"],
    queryFn: async () => (await supabase.from("formacoes").select("*").order("data_conclusao", { ascending: false, nullsFirst: false })).data ?? [],
  });
  const { data: experiencias = [] } = useQuery({
    queryKey: ["experiencias"],
    queryFn: async () => (await supabase.from("experiencias").select("*").order("ordem")).data ?? [],
  });
  const { data: voluntariados = [] } = useQuery({
    queryKey: ["voluntariados"],
    queryFn: async () => (await supabase.from("voluntariados").select("*").order("ordem")).data ?? [],
  });
  const { data: projetos = [] } = useQuery({
    queryKey: ["projetos_home"],
    queryFn: async () => (await supabase.from("projetos").select("*").eq("publicado", true).order("ordem").limit(3)).data ?? [],
  });

  const heroImage = s?.hero_image_url || null;

  return (
    <>
      <Helmet>
        <title>{s?.hero_name ?? "Vanina Carolina"} — Portfólio</title>
        <meta name="description" content={s?.hero_intro ?? ""} />
      </Helmet>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-end pb-20 overflow-hidden">
        <div className="container-editorial relative">
          <motion.div style={{ opacity }} className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="text-eyebrow mb-6">Portfólio · 2026</motion.div>
              <h1 className="text-display-xl">
                {(s?.hero_name ?? "Vanina Carolina").split(" ").map((w, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block mr-[0.25em]">
                    {i === 1 ? <em className="italic font-light">{w}</em> : w}
                  </motion.span>
                ))}
              </h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                className="mt-8 max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed prose-editorial"
                dangerouslySetInnerHTML={{ __html: s?.hero_intro || "" }} />
            </div>
            <div className="md:col-span-5 md:justify-self-end">
              <motion.div style={{ y: yImg }} className="relative aspect-[3/4] w-full max-w-sm overflow-hidden bg-secondary">
                {heroImage && (
                  <img
                    src={heroImage}
                    alt={s?.hero_name ?? ""}
                    loading="eager"
                    // @ts-ignore
                    fetchpriority="high"
                    decoding="async"
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
        <motion.button
          type="button"
          onClick={scrollToNext}
          aria-label="Rolar para o próximo conteúdo"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-20">
          <span>Role</span>
          <ArrowDown size={14} className="animate-bounce" />
        </motion.button>
      </section>

      {/* MARQUEE */}
      <section id="apos-hero" className="border-y border-border py-8 overflow-hidden bg-secondary/40">
        <div className="marquee font-display text-4xl md:text-6xl text-foreground/80">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-16 items-center pr-16">
              {(s?.marquee_palavras && s.marquee_palavras.length > 0
                ? s.marquee_palavras
                : ["Estratégia", "Criatividade", "Gestão", "Impacto", "Design"]
              ).map((word, idx) => (
                <span key={idx} className="flex items-center gap-16">
                  <span className={idx % 2 === 1 ? "italic" : ""}>{word}</span>
                  <span className="text-accent">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section className="container-editorial py-32">
        <div className="grid md:grid-cols-12 gap-12">
          <Reveal className="md:col-span-4"><div className="text-eyebrow">— Sobre</div></Reveal>
          <Reveal delay={0.1} className="md:col-span-8">
            <div className="text-display-md font-light prose-editorial" dangerouslySetInnerHTML={{ __html: s?.about_text || "" }} />
          </Reveal>
        </div>
      </section>

      {/* EXPERIÊNCIA */}
      <Section eyebrow="Experiência" title="Trajetória profissional">
        <div className="divide-y divide-border border-y border-border">
          {experiencias.length === 0 && <Empty label="Nenhuma experiência cadastrada ainda." />}
          {experiencias.map((e: any, i) => (
            <Reveal key={e.id} delay={i * 0.05}>
              <div className="grid md:grid-cols-12 gap-6 md:gap-8 py-8 group">
                <div className="md:col-span-3">
                  <div className="text-sm text-muted-foreground">{e.periodo}</div>
                  <div className="mt-1 text-foreground/75 text-sm">{e.empresa}</div>
                </div>
                <div className="md:col-span-3 font-display text-2xl leading-tight">{e.cargo}</div>
                <div className="md:col-span-6 prose-editorial text-base text-foreground/75 leading-relaxed" dangerouslySetInnerHTML={{ __html: e.descricao || "" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FORMAÇÃO */}
      <Section eyebrow="Formação" title="Educação e estudos">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {formacoes.length === 0 && <Empty label="Nenhuma formação cadastrada ainda." />}
          {formacoes.map((f: any, i) => (
            <Reveal key={f.id} delay={i * 0.05}>
              <div className="border-l-2 border-accent pl-5">
                <div className="text-xs text-muted-foreground mb-1">{f.periodo}</div>
                <h3 className="font-display text-2xl">{f.titulo}</h3>
                <div className="text-foreground/70">{f.instituicao}</div>
                {f.descricao && <div className="prose-editorial text-sm text-foreground/65 mt-2" dangerouslySetInnerHTML={{ __html: f.descricao }} />}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* VOLUNTARIADO */}
      <Section eyebrow="Voluntariado" title="Atuação social">
        <div className="grid md:grid-cols-3 gap-8">
          {voluntariados.length === 0 && <Empty label="Nenhuma atividade cadastrada ainda." />}
          {voluntariados.map((v: any, i) => (
            <Reveal key={v.id} delay={i * 0.05}>
              <Link to="/atuacao-social" className="block bg-secropdary/50 group h-full">
                <div className="bg-secondary/50 h-full flex flex-col">
                  {v.cover_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={v.cover_url} alt={v.titulo} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-8 flex-1">
                    <div className="text-xs text-muted-foreground mb-2">{v.periodo}</div>
                    <h3 className="font-display text-xl mb-1">{v.titulo}</h3>
                    <div className="text-foreground/70 text-sm mb-3">{v.organizacao}</div>
                    <p className="text-sm text-foreground/65 line-clamp-3">{v.descricao}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PROJETOS */}
      <section className="container-editorial py-32">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-16">
            <div>
              <div className="text-eyebrow mb-3">— Projetos selecionados</div>
              <h2 className="text-display-lg">Trabalhos<br /><em className="italic font-light">recentes</em></h2>
            </div>
            <Link to="/projetos" className="inline-flex items-center gap-2 hover-underline">
              Ver todos <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>

        {projetos.length === 0 ? (
          <Empty label="Nenhum projeto publicado ainda." />
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-20">
            {projetos.map((p: any, i) => (
              <Reveal key={p.id} delay={i * 0.1} className={i % 2 === 1 ? "md:mt-24" : ""}>
                <Link to={`/projetos/${p.slug}`} className="block group">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary mb-5">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : <div className="w-full h-full bg-muted" />}
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl md:text-3xl">{p.titulo}</h3>
                    <ArrowUpRight className="shrink-0 transition-transform group-hover:rotate-45" size={20} />
                  </div>
                  {p.categoria && <div className="text-sm text-muted-foreground mt-1">{p.categoria}</div>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* CTA Contato */}
      <section className="container-editorial py-32 border-t border-border">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-eyebrow mb-6">— Vamos conversar</div>
            <h2 className="text-display-lg mb-8">
              Tem um <em className="italic font-light">projeto</em><br />em mente?
            </h2>
            <Link to="/contato"
              className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
              Iniciar conversa <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
};

const Section = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => (
  <section className="container-editorial py-24">
    <Reveal>
      <div className="mb-12">
        <div className="text-eyebrow mb-3">— {eyebrow}</div>
        <h2 className="text-display-lg">{title}</h2>
      </div>
    </Reveal>
    {children}
  </section>
);

const Empty = ({ label }: { label: string }) => (
  <div className="text-muted-foreground italic py-8">{label}</div>
);

export default Index;
