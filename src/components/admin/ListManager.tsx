import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { EditorialImageSingle, EditorialImageGallery } from "@/components/admin/EditorialImage";
import { RichEditor } from "@/components/admin/RichEditor";
import { RichEditorMini } from "@/components/admin/RichEditorMini";
import { uploadMedia } from "@/lib/upload";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical, Paperclip, X } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Field {
  key: string;
  label: string;
  type?: "text" | "richtext-mini" | "textarea" | "richtext" | "date" | "files" | "image" | "gallery" | "url";
}

interface Props {
  table: "formacoes" | "experiencias" | "voluntariados";
  title: string;
  fields: Field[];
  /** se houver, ordena automaticamente por este campo (data desc) e oculta drag&drop */
  autoSortByDate?: string;
}

export const ListManager = ({ table, title, fields, autoSortByDate }: Props) => {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      if (autoSortByDate) {
        const { data } = await supabase.from(table).select("*").order(autoSortByDate, { ascending: false, nullsFirst: false });
        return data ?? [];
      }
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [localOrder, setLocalOrder] = useState<any[]>([]);

  useEffect(() => { setLocalOrder(items); }, [items]);

  const startNew = () => {
    const blank: any = { ordem: items.length, conteudo_pronto: false };
    fields.forEach(f => {
      if (f.type === "files" || f.type === "gallery") blank[f.key] = [];
      else if (f.type === "image") blank[f.key] = null;
      else blank[f.key] = "";
    });
    setForm(blank); setEditing("new");
  };
  const startEdit = (it: any) => {
    const copy: any = { ...it };
    fields.forEach(f => {
      if (f.type === "files" && !Array.isArray(copy[f.key])) copy[f.key] = [];
      if (f.type === "gallery" && !Array.isArray(copy[f.key])) copy[f.key] = [];
    });
    setForm(copy); setEditing(it.id);
  };

  const save = async () => {
    const payload: any = { ordem: form.ordem ?? 0 };
    fields.forEach(f => {
      let v = form[f.key];
      if (f.type === "date" && v === "") v = null;
      if ((f.type === "files" || f.type === "gallery") && !Array.isArray(v)) v = [];
      payload[f.key] = v ?? ((f.type === "files" || f.type === "gallery") ? [] : (f.type === "image" ? null : ""));
    });
    if (editing === "new") {
      const { error } = await supabase.from(table).insert(payload);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from(table).update(payload).eq("id", editing);
      if (error) return toast.error(error.message);
    }
    toast.success("Salvo! Site atualizado.");
    setEditing(null);
    qc.invalidateQueries({ queryKey: [table] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    qc.invalidateQueries({ queryKey: [table] });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = localOrder.findIndex((x: any) => x.id === active.id);
    const newIdx = localOrder.findIndex((x: any) => x.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(localOrder, oldIdx, newIdx);
    setLocalOrder(reordered);
    const updates = await Promise.all(reordered.map((it: any, idx: number) =>
      supabase.from(table).update({ ordem: idx }).eq("id", it.id)
    ));
    const failed = updates.find(({ error }) => error)?.error;
    if (failed) {
      toast.error(failed.message);
      qc.invalidateQueries({ queryKey: [table] });
      return;
    }
    qc.invalidateQueries({ queryKey: [table] });
    toast.success("Ordem atualizada");
  };

  const addAttachment = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    try {
      const uploaded = await Promise.all(files.map(async f => ({ url: await uploadMedia(f, "anexos"), name: f.name })));
      setForm({ ...form, [fieldKey]: [...(form[fieldKey] || []), ...uploaded] });
      toast.success("Arquivos enviados");
    } catch (err: any) { toast.error(err.message || "Erro no upload"); }
    finally { e.target.value = ""; }
  };

  const removeAttachment = (fieldKey: string, idx: number) => {
    setForm({ ...form, [fieldKey]: form[fieldKey].filter((_: any, i: number) => i !== idx) });
  };

  const addGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    try {
      const urls = await Promise.all(files.map(f => uploadMedia(f, "galeria")));
      setForm({ ...form, [fieldKey]: [...(form[fieldKey] || []), ...urls] });
      toast.success(`${urls.length} adicionada(s)`);
    } catch (err: any) { toast.error(err.message || "Erro no upload"); }
    finally { e.target.value = ""; }
  };

  const renderField = (f: Field) => {
    if (f.type === "richtext") return <RichEditor value={form[f.key] ?? ""} onChange={v => setForm({ ...form, [f.key]: v })} />;
    if (f.type === "richtext-mini") return <RichEditorMini value={form[f.key] ?? ""} onChange={v => setForm({ ...form, [f.key]: v })} placeholder={f.label} />;
    if (f.type === "textarea") return <Textarea rows={3} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />;
    if (f.type === "date") return <Input type="date" value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />;
    if (f.type === "url") return <Input type="url" value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder="https://…" />;
    if (f.type === "image") return <ImageUpload value={form[f.key]} onChange={v => setForm({ ...form, [f.key]: v })} folder="lista" />;
    if (f.type === "gallery") {
      return <EditorialImageGallery value={form[f.key] || []} onChange={v => setForm({ ...form, [f.key]: v })} folder="galeria" />;
    }
    if (f.type === "files") {
      const items = form[f.key] || [];
      return (
        <div className="space-y-2">
          {items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {items.map((a: any, i: number) => (
                <div key={i} className="relative group border border-border bg-background p-2 flex items-center gap-2 text-xs">
                  {a.url?.match(/\.(jpe?g|png|webp|gif)$/i)
                    ? <img src={a.url} alt="" className="w-12 h-12 object-cover" />
                    : <Paperclip size={14} className="shrink-0" />}
                  <a href={a.url} target="_blank" rel="noreferrer" className="truncate flex-1 hover:underline">{a.name || "arquivo"}</a>
                  <button type="button" onClick={() => removeAttachment(f.key, i)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <label>
            <input type="file" multiple onChange={e => addAttachment(e, f.key)} className="hidden" accept="image/*,application/pdf,.doc,.docx" />
            <Button type="button" variant="outline" size="sm" className="gap-2 cursor-pointer pointer-events-none"><Plus size={14} /> Anexar</Button>
          </label>
        </div>
      );
    }
    return <RichEditorMini value={form[f.key] ?? ""} onChange={v => setForm({ ...form, [f.key]: v })} placeholder={f.label} />;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">{title}</h1>
          {autoSortByDate && <p className="text-sm text-muted-foreground mt-1">Ordenado automaticamente pela data de conclusão (mais recente primeiro)</p>}
        </div>
        <Button onClick={startNew} className="gap-2 rounded-none"><Plus size={16} /> Novo</Button>
      </div>

      {editing && (
        <div className="border border-border p-6 space-y-4 bg-secondary/30">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <div className="mt-1.5">{renderField(f)}</div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={save} className="rounded-none">Salvar</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-none">Cancelar</Button>
          </div>
        </div>
      )}

      {localOrder.length === 0 && <div className="py-8 text-muted-foreground italic">Nenhum item ainda.</div>}

      {!autoSortByDate ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={localOrder.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="border-y border-border divide-y">
              {localOrder.map((it: any) => (
                <SortableRow key={it.id} item={it} fields={fields} onEdit={startEdit} onRemove={remove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="border-y border-border divide-y">
          {localOrder.map((it: any) => (
            <Row key={it.id} item={it} fields={fields} onEdit={startEdit} onRemove={remove} draggable={false} />
          ))}
        </div>
      )}
    </div>
  );
};

const SortableRow = ({ item, fields, onEdit, onRemove }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <Row item={item} fields={fields} onEdit={onEdit} onRemove={onRemove} dragHandle={{ ...attributes, ...listeners }} draggable />
    </div>
  );
};

const stripHtml = (v: any) => typeof v === "string" ? v.replace(/<[^>]+>/g, "").trim() : (v ?? "");

const Row = ({ item, fields, onEdit, onRemove, dragHandle, draggable }: any) => (
  <div className="py-4 flex items-center gap-3">
    {draggable && (
      <button {...dragHandle} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1" title="Arrastar para reordenar">
        <GripVertical size={16} />
      </button>
    )}
    <div className="flex-1 cursor-pointer min-w-0" onClick={() => onEdit(item)}>
      <div className="font-medium truncate">{stripHtml(item[fields[0].key]) || "—"}</div>
      <div className="text-sm text-muted-foreground truncate">{stripHtml(item[fields[1]?.key])}</div>
    </div>
    <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}><Trash2 size={16} /></Button>
  </div>
);
