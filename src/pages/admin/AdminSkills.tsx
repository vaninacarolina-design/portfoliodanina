import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Skill = any;

const blank = (ordem: number) => ({
  nome: "", categoria: "Softwares", logo_url: null as string | null,
  ordem, visivel: true, conteudo_pronto: false,
});

const AdminSkills = () => {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["skills_admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("skills").select("*")
        .order("categoria", { ascending: true })
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Skill[];
    },
  });

  const [list, setList] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => { setList(items); }, [items]);

  const categoriasExistentes = Array.from(new Set(items.map((i: Skill) => i.categoria).filter(Boolean)));

  const startNew = () => { setForm(blank(items.length)); setEditing("new"); };
  const startEdit = (it: Skill) => { setForm({ ...it }); setEditing(it.id); };

  const save = async () => {
    if (!form.nome?.trim() || !form.categoria?.trim()) {
      return toast.error("Preencha nome e categoria.");
    }
    if (form.conteudo_pronto && !form.nome.trim()) return toast.error("Preencha o nome antes de publicar.");
    const payload = {
      nome: form.nome.trim(), categoria: form.categoria.trim(), logo_url: form.logo_url ?? null,
      ordem: form.ordem ?? 0, visivel: !!form.visivel, conteudo_pronto: !!form.conteudo_pronto,
    };
    const q = editing === "new"
      ? (supabase as any).from("skills").insert(payload)
      : (supabase as any).from("skills").update(payload).eq("id", editing);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Salvo! Site atualizado.");
    setEditing(null); setForm(null);
    qc.invalidateQueries({ queryKey: ["skills_admin"] });
    qc.invalidateQueries({ queryKey: ["skills_page"] });
    qc.invalidateQueries({ queryKey: ["nav_sections"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta habilidade?")) return;
    const { error } = await (supabase as any).from("skills").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluída");
    qc.invalidateQueries({ queryKey: ["skills_admin"] });
    qc.invalidateQueries({ queryKey: ["skills_page"] });
    qc.invalidateQueries({ queryKey: ["nav_sections"] });
  };

  const patch = async (it: Skill, values: any) => {
    if (values.conteudo_pronto && !it.nome?.trim()) {
      return toast.error("Preencha o nome antes de marcar como pronto.");
    }
    const { error } = await (supabase as any).from("skills").update(values).eq("id", it.id);
    if (error) return toast.error(error.message);
    setList(prev => prev.map(x => x.id === it.id ? { ...x, ...values } : x));
    qc.invalidateQueries({ queryKey: ["skills_admin"] });
    qc.invalidateQueries({ queryKey: ["skills_page"] });
    qc.invalidateQueries({ queryKey: ["nav_sections"] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = list.findIndex(x => x.id === active.id);
    const newIdx = list.findIndex(x => x.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(list, oldIdx, newIdx);
    setList(reordered);
    await Promise.all(reordered.map((it, idx) =>
      (supabase as any).from("skills").update({ ordem: idx }).eq("id", it.id)));
    qc.invalidateQueries({ queryKey: ["skills_admin"] });
    qc.invalidateQueries({ queryKey: ["skills_page"] });
    toast.success("Ordem atualizada");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Habilidades agrupadas por categoria (ex.: Softwares, Gestão, Idiomas). Arraste para reordenar.
          </p>
        </div>
        <Button onClick={startNew} className="gap-2 rounded-none"><Plus size={16} /> Nova</Button>
      </div>

      {editing && form && (
        <div className="border border-border p-6 space-y-4 bg-secondary/30">
          <div>
            <Label>Nome da habilidade *</Label>
            <Input className="mt-1.5" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Design Editorial" />
          </div>
          <div>
            <Label>Categoria *</Label>
            <Input className="mt-1.5" list="cats" value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Softwares / Gestão / Idiomas" />
            <datalist id="cats">
              {categoriasExistentes.map(c => <option key={c as string} value={c as string} />)}
            </datalist>
          </div>
          <div>
            <Label>Ícone / logo (opcional)</Label>
            <div className="mt-2">
              <ImageUpload value={form.logo_url} onChange={url => setForm({ ...form, logo_url: url })} folder="skills" label="Enviar logo" />
            </div>
          </div>

          <label className="flex items-center justify-between border border-border bg-background p-3">
            <span className="text-sm">
              <span className="font-medium">{form.visivel ? "Aparecer no site" : "Não aparecer"}</span>
              <span className="block text-muted-foreground text-xs mt-0.5">Liga/desliga esta habilidade.</span>
            </span>
            <Switch checked={!!form.visivel} onCheckedChange={v => setForm({ ...form, visivel: v })} />
          </label>

          <label className="flex items-start gap-3 border border-border bg-background p-3 cursor-pointer">
            <Checkbox checked={!!form.conteudo_pronto} className="mt-0.5"
              onCheckedChange={v => setForm({ ...form, conteudo_pronto: v === true })} />
            <span className="text-sm">
              <span className="font-medium">Conteúdo pronto para publicar</span>
              <span className="block text-muted-foreground text-xs mt-0.5">
                Enquanto estiver desmarcado, fica oculto no site mesmo com "Aparecer" ligado.
              </span>
            </span>
          </label>

          <div className="flex gap-2">
            <Button onClick={save} className="rounded-none">Salvar</Button>
            <Button variant="outline" onClick={() => { setEditing(null); setForm(null); }} className="rounded-none">Cancelar</Button>
          </div>
        </div>
      )}

      {list.length === 0 && <div className="py-8 text-muted-foreground italic">Nenhuma habilidade ainda.</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={list.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="border-y border-border divide-y">
            {list.map(it => <SkillRow key={it.id} item={it} onEdit={startEdit} onRemove={remove} onPatch={patch} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SkillRow = ({ item, onEdit, onRemove, onPatch }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const noSite = item.visivel && item.conteudo_pronto;
  return (
    <div ref={setNodeRef} style={style} className="py-4 flex items-center gap-3">
      <button {...attributes} {...listeners} title="Arrastar para reordenar"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1">
        <GripVertical size={16} />
      </button>
      {item.logo_url && <img src={item.logo_url} alt="" className="w-7 h-7 object-contain" />}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
        <div className="font-medium truncate">{item.nome || "—"}</div>
        <div className="text-sm text-muted-foreground truncate">{item.categoria}</div>
      </div>
      <span className={`text-xs shrink-0 ${noSite ? "text-muted-foreground" : "text-destructive"}`}>
        {noSite ? "No site" : item.visivel ? "Aguardando conteúdo" : "Oculto"}
      </span>
      <Switch checked={!!item.visivel} onCheckedChange={v => onPatch(item, { visivel: v })} />
      <label className="flex items-center gap-2 text-xs shrink-0 cursor-pointer" title="Conteúdo pronto para publicar">
        <Checkbox checked={!!item.conteudo_pronto} onCheckedChange={v => onPatch(item, { conteudo_pronto: v === true })} />
        Pronto
      </label>
      <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}><Trash2 size={16} /></Button>
    </div>
  );
};

export default AdminSkills;
