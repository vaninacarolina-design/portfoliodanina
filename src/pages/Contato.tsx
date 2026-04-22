import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Reveal } from "@/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";

const Contato = () => {
  const { data: s } = useSettings();
  const wppLink = `https://wa.me/${(s?.whatsapp_number || "5541999288087").replace(/\D/g, "")}?text=${encodeURIComponent("Olá Vanina, vim pelo seu site.")}`;

  // Aplica fundo escuro ao <html> enquanto a página estiver montada (evita "flash" branco em volta)
  useEffect(() => {
    document.documentElement.classList.add("page-dark");
    return () => document.documentElement.classList.remove("page-dark");
  }, []);

  return (
    <>
      <Helmet><title>Contato · Vanina Carolina</title></Helmet>
      <div className="bg-foreground text-background -mt-16 md:-mt-20 pt-16 md:pt-20 min-h-screen">
        <section className="container-editorial py-24 md:py-32 min-h-[90vh] flex flex-col justify-center">
          <Reveal>
            <div className="text-eyebrow !text-background/50 mb-6">— Contato</div>
            <h1 className="text-display-xl">
              Vamos<br /><em className="italic font-light text-accent">conversar</em>.
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-10 max-w-2xl text-lg text-background/75 leading-relaxed">{s?.contact_intro}</p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-12 flex flex-wrap gap-4">
              <a href={wppLink} target="_blank" rel="noreferrer"
                className="group inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                WhatsApp · {s?.whatsapp_display}
                <ArrowUpRight size={18} className="transition-transform group-hover:rotate-45" />
              </a>
              {s?.email && (
                <a href={`mailto:${s.email}`}
                  className="inline-flex items-center gap-3 border border-background/50 px-8 py-4 hover:bg-background hover:text-foreground transition-colors">
                  {s.email} <ArrowUpRight size={18} />
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="mt-20 grid sm:grid-cols-3 gap-8 max-w-3xl">
              {s?.social_instagram && <Social href={s.social_instagram} label="Instagram" />}
              {s?.social_linkedin && <Social href={s.social_linkedin} label="LinkedIn" />}
              {s?.social_behance && <Social href={s.social_behance} label="Behance" />}
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
};

const Social = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-t border-background/30 pt-3 hover:border-accent transition-colors">
    <span className="font-display text-xl">{label}</span>
    <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
  </a>
);

export default Contato;
