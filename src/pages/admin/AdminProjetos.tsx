import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const AdminProjetos = () => {
  const qc = useQueryClient();
  const { data: projetos = [] } = useQuery({
    queryKey: ["projetos_admin"],
    queryFn: async () => (await supabase.from("projetos").select("*").order("ordem")).data ?? [],
  });

  const togglePub = async (p: any) => {
    await supabase.from("projetos").update({ publicado: !p.publicado }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir projeto?")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
  };
  const move = async (p: any, dir: -1 | 1) => {
    const idx = projetos.findIndex((x: any) => x.id === p.id);
    const swap = projetos[idx + dir]; if (!swap) return;
    await supabase.from("projetos").update({ ordem: (swap as any).ordem }).eq("id", p.id);
    await supabase.from("projetos").update({ ordem: p.ordem }).eq("id", (swap as any).id);
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Projetos</h1>
          <p className="text-muted-foreground">Gerencie todos os projetos do portfólio.</p>
        </div>
        <Link to="/admin/projetos/novo"><Button className="gap-2 rounded-none"><Plus size={16} /> Novo projeto</Button></Link>
      </div>

      <div className="border-y border-border divide-y">
        {projetos.length === 0 && <div className="py-10 text-muted-foreground italic">Nenhum projeto ainda.</div>}
        {projetos.map((p: any, i) => (
          <div key={p.id} className="py-4 flex items-center gap-4">
            <div className="flex flex-col">
              <button onClick={() => move(p, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => move(p, 1)} disabled={i === projetos.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown size={14} /></button>
            </div>
            <div className="w-16 h-16 bg-secondary shrink-0 overflow-hidden">
              {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.titulo}</div>
              <div className="text-sm text-muted-foreground truncate">{p.categoria || "—"} · /{p.slug}</div>
            </div>
            <div className={`text-xs px-2 py-1 ${p.publicado ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {p.publicado ? "Publicado" : "Rascunho"}
            </div>
            <Button variant="ghost" size="icon" onClick={() => togglePub(p)} title="Publicar/Despublicar">
              {p.publicado ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Link to={`/admin/projetos/${p.id}`}><Button variant="ghost" size="icon"><Edit3 size={16} /></Button></Link>
            <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 size={16} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminProjetos;
