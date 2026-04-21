import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Card = ({ label, value, to }: { label: string; value: number | string; to: string }) => (
  <Link to={to} className="block border border-border p-6 hover:border-accent transition-colors">
    <div className="text-eyebrow mb-3">{label}</div>
    <div className="font-display text-4xl">{value}</div>
  </Link>
);

const AdminDashboard = () => {
  const counts = useQuery({
    queryKey: ["admin_counts"],
    queryFn: async () => {
      const [p, f, e, v] = await Promise.all([
        supabase.from("projetos").select("*", { count: "exact", head: true }),
        supabase.from("formacoes").select("*", { count: "exact", head: true }),
        supabase.from("experiencias").select("*", { count: "exact", head: true }),
        supabase.from("voluntariados").select("*", { count: "exact", head: true }),
      ]);
      return { projetos: p.count ?? 0, formacoes: f.count ?? 0, experiencias: e.count ?? 0, voluntariados: v.count ?? 0 };
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Olá!</h1>
      <p className="text-muted-foreground mb-10">Gerencie todo o conteúdo do seu portfólio.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Projetos" value={counts.data?.projetos ?? "—"} to="/admin/projetos" />
        <Card label="Formações" value={counts.data?.formacoes ?? "—"} to="/admin/formacoes" />
        <Card label="Experiências" value={counts.data?.experiencias ?? "—"} to="/admin/experiencias" />
        <Card label="Voluntariado" value={counts.data?.voluntariados ?? "—"} to="/admin/voluntariados" />
      </div>
    </div>
  );
};
export default AdminDashboard;
