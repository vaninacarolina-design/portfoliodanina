import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavSections } from "@/hooks/useNavSections";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const sections = useNavSections();

  const links = [
    { to: "/", label: "Home", show: true },
    { to: "/sobre", label: "Sobre Mim", show: sections.sobre },
    { to: "/projetos", label: "Projetos", show: sections.projetos },
    { to: "/skills", label: "Skills", show: sections.skills },
    { to: "/atuacao-social", label: "Atuação Social", show: sections.atuacaoSocial },
    { to: "/contato", label: "Contato", show: sections.contato },
  ].filter(l => l.show);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  // trava o scroll do fundo enquanto o menu mobile estiver aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
      solid
        ? "bg-background border-b border-border/60 text-foreground"
        : "bg-transparent text-white mix-blend-difference"
    )}>
      <div className="container-editorial flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl tracking-tight">
          Vanina<span className={solid ? "text-accent" : ""}>.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}
              className={({ isActive }) => cn(
                "text-sm tracking-wide hover-underline pb-1 transition-colors hover:text-accent",
                isActive && "text-accent"
              )}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-background text-foreground border-t border-border overflow-y-auto">
            <div className="container-editorial py-8 flex flex-col gap-5">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}
                  className={({ isActive }) => cn("font-display text-3xl", isActive && "text-accent")}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
