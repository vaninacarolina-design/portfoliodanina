import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit3, Eye, EyeOff, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const AdminProjetos = () => {
  const qc = useQueryClient();
  const { data: projetos = [] } = useQuery({
    queryKey: ["projetos_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [order, setOrder] = useState<any[]>([]);
  useEffect(() => { setOrder(projetos); }, [projetos]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
    qc.invalidateQueries({ queryKey: ["projetos_all"] });
    qc.invalidateQueries({ queryKey: ["projetos_home"] });
  };

  const togglePub = async (p: any) => {
    if (!p.publicado && !p.conteudo_pronto)
      return toast.error("Marque “Conteúdo pronto para publicar” antes de exibir no site.");
    const { error } = await supabase.from("projetos").update({ publicado: !p.publicado }).eq("id", p.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const togglePronto = async (p: any) => {
    const { error } = await supabase.from("projetos").update({ conteudo_pronto: !p.conteudo_pronto }).eq("id", p.id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir projeto?")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
    qc.invalidateQueries({ queryKey: ["projetos_all"] });
    qc.invalidateQueries({ queryKey: ["projetos_home"] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.findIndex((x) => x.id === active.id);
    const newIdx = order.findIndex((x) => x.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(order, oldIdx, newIdx);
    setOrder(reordered);
    const updates = await Promise.all(reordered.map((it: any, idx: number) =>
      supabase.from("projetos").update({ ordem: idx }).eq("id", it.id)
    ));
    const failed = updates.find(({ error }) => error)?.error;
    if (failed) {
      toast.error(failed.message);
      qc.invalidateQueries({ queryKey: ["projetos_admin"] });
      return;
    }
    qc.invalidateQueries({ queryKey: ["projetos_admin"] });
    qc.invalidateQueries({ queryKey: ["projetos_all"] });
    qc.invalidateQueries({ queryKey: ["projetos_home"] });
    toast.success("Ordem atualizada");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Projetos</h1>
          <p className="text-muted-foreground">Arraste para reordenar.</p>
        </div>
        <Link to="/admin/projetos/novo"><Button className="gap-2 rounded-none"><Plus size={16} /> Novo projeto</Button></Link>
      </div>

      {order.length === 0 && <div className="py-10 text-muted-foreground italic">Nenhum projeto ainda.</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="border-y border-border divide-y">
            {order.map((p: any) => (
              <SortableProjectRow key={p.id} p={p} togglePub={togglePub} togglePronto={togglePronto} remove={remove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableProjectRow = ({ p, togglePub, togglePronto, remove }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="py-4 flex items-center gap-3">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1" title="Arrastar para reordenar">
        <GripVertical size={16} />
      </button>
      <div className="w-16 h-16 bg-secondary shrink-0 overflow-hidden">
        {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{(p.titulo || "").replace(/<[^>]+>/g, "") || "—"}</div>
        <div className="text-sm text-muted-foreground truncate">{(p.categoria || "").replace(/<[^>]+>/g, "") || "—"} · /{p.slug}</div>
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer shrink-0" title="Conteúdo pronto para publicar">
        <Checkbox checked={!!p.conteudo_pronto} onCheckedChange={() => togglePronto(p)} />
        <span className="hidden md:inline">Conteúdo pronto</span>
      </label>
      <div className={`text-xs px-2 py-1 ${p.publicado && p.conteudo_pronto ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
        {p.publicado && p.conteudo_pronto ? "No site" : p.publicado ? "Aguardando conteúdo" : "Rascunho"}
      </div>
      <Button variant="ghost" size="icon" onClick={() => togglePub(p)} title="Publicar/Despublicar">
        {p.publicado ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      <Link to={`/admin/projetos/${p.id}`}><Button variant="ghost" size="icon"><Edit3 size={16} /></Button></Link>
      <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 size={16} /></Button>
    </div>
  );
};

export default AdminProjetos;
