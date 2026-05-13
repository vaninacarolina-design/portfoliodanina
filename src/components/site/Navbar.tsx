import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/sobre", label: "Sobre Mim" },
  { to: "/projetos", label: "Projetos" },
  { to: "/atuacao-social", label: "Atuação Social" },
  { to: "/contato", label: "Contato" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-500",
      scrolled
        ? "bg-background/85 backdrop-blur-md border-b border-border/60 text-foreground"
        : "bg-transparent text-white mix-blend-difference"
    )}>
      <div className="container-editorial flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl tracking-tight">
          Vanina<span className={scrolled ? "text-accent" : ""}>.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
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

        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-background border-t border-border">
            <div className="container-editorial py-6 flex flex-col gap-4">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === "/"}
                  className={({ isActive }) => cn("font-display text-2xl", isActive && "text-accent")}>
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
