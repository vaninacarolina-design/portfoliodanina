import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

export const Footer = () => {
  const { data: s } = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-32">
      <div className="container-editorial py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="font-display text-3xl">Vanina<span className="text-accent">.</span></div>
          <p className="text-muted-foreground mt-3 text-sm max-w-xs">{s?.contact_intro}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-eyebrow mb-3">Navegar</div>
          <Link to="/" className="block hover-underline w-fit">Home</Link>
          <Link to="/projetos" className="block hover-underline w-fit">Projetos</Link>
          <Link to="/contato" className="block hover-underline w-fit">Contato</Link>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-eyebrow mb-3">Contato</div>
          {s?.whatsapp_display && <div>WhatsApp · {s.whatsapp_display}</div>}
          {s?.email && <a href={`mailto:${s.email}`} className="block hover-underline w-fit">{s.email}</a>}
          {s?.social_instagram && <a href={s.social_instagram} target="_blank" rel="noreferrer" className="block hover-underline w-fit">Instagram</a>}
          {s?.social_linkedin && <a href={s.social_linkedin} target="_blank" rel="noreferrer" className="block hover-underline w-fit">LinkedIn</a>}
        </div>
      </div>
      <div className="container-editorial pb-8 text-xs text-muted-foreground">
        <div>© {year} Vanina Carolina. Todos os direitos reservados.</div>
      </div>
    </footer>
  );
};
