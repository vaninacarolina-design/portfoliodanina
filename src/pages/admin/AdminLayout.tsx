import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/projetos", label: "Projetos" },
  { to: "/admin/configuracoes", label: "Home & Hero" },
  { to: "/admin/sobre", label: "Sobre Mim" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/formacoes", label: "Formações" },
  { to: "/admin/experiencias", label: "Experiências" },
  { to: "/admin/voluntariados", label: "Voluntariado" },
  { to: "/admin/contato", label: "Contato" },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-3xl">Acesso negado</h1>
      <p className="text-muted-foreground">Sua conta não tem permissão de administrador.</p>
      <Button onClick={signOut} variant="outline">Sair</Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 border-r border-border md:min-h-screen p-6 flex flex-col">
        <div className="font-display text-xl mb-8">Admin<span className="text-accent">.</span></div>
        <nav className="flex md:flex-col gap-1 flex-wrap">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => cn(
                "px-3 py-2 text-sm rounded-sm transition-colors",
                isActive ? "bg-foreground text-background" : "hover:bg-secondary"
              )}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8 space-y-2">
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          <Button onClick={signOut} variant="outline" size="sm" className="w-full gap-2">
            <LogOut size={14} /> Sair
          </Button>
          <a href="/" className="block text-xs text-muted-foreground hover-underline w-fit">← Ver site</a>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
