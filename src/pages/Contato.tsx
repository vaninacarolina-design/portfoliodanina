import { Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/useSettings";
import { Reveal } from "@/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";

const Contato = () => {
  const { data: s } = useSettings();
  const wppLink = `https://wa.me/${(s?.whatsapp_number || "5541999288087").replace(/\D/g, "")}?text=${encodeURIComponent("Olá Vanina, vim pelo seu site.")}`;

  return (
    <>
      <Helmet><title>Contato · Vanina Carolina</title></Helmet>
      <section className="container-editorial py-24 min-h-[80vh] flex flex-col justify-center">
        <Reveal>
          <div className="text-eyebrow mb-6">— Contato</div>
          <h1 className="text-display-xl">
            Vamos<br /><em className="italic font-light">conversar</em>.
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-2xl text-lg text-foreground/75 leading-relaxed">{s?.contact_intro}</p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-12 flex flex-wrap gap-4">
            <a href={wppLink} target="_blank" rel="noreferrer"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-colors">
              WhatsApp · {s?.whatsapp_display}
              <ArrowUpRight size={18} className="transition-transform group-hover:rotate-45" />
            </a>
            {s?.email && (
              <a href={`mailto:${s.email}`}
                className="inline-flex items-center gap-3 border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-colors">
                {s.email} <ArrowUpRight size={18} />
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <div className="mt-16 grid sm:grid-cols-3 gap-8 max-w-2xl">
            {s?.social_instagram && <Social href={s.social_instagram} label="Instagram" />}
            {s?.social_linkedin && <Social href={s.social_linkedin} label="LinkedIn" />}
            {s?.social_behance && <Social href={s.social_behance} label="Behance" />}
          </div>
        </Reveal>
      </section>
    </>
  );
};

const Social = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-t border-border pt-3 hover:border-accent transition-colors">
    <span className="font-display text-xl">{label}</span>
    <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
  </a>
);

export default Contato;
