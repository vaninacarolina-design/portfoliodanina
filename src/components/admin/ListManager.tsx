import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";

interface Field { key: string; label: string; type?: "text" | "textarea" }
interface Props {
  table: "formacoes" | "experiencias" | "voluntariados";
  title: string;
  fields: Field[];
}

export const ListManager = ({ table, title, fields }: Props) => {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: [table],
    queryFn: async () => (await supabase.from(table).select("*").order("ordem")).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const startNew = () => {
    const blank: any = { ordem: items.length };
    fields.forEach(f => blank[f.key] = "");
    setForm(blank); setEditing("new");
  };
  const startEdit = (it: any) => { setForm(it); setEditing(it.id); };

  const save = async () => {
    const payload: any = { ordem: form.ordem ?? 0 };
    fields.forEach(f => payload[f.key] = form[f.key] ?? "");
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

  const move = async (it: any, dir: -1 | 1) => {
    const idx = items.findIndex((x: any) => x.id === it.id);
    const swap = items[idx + dir]; if (!swap) return;
    await supabase.from(table).update({ ordem: (swap as any).ordem }).eq("id", it.id);
    await supabase.from(table).update({ ordem: it.ordem }).eq("id", (swap as any).id);
    qc.invalidateQueries({ queryKey: [table] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">{title}</h1>
        <Button onClick={startNew} className="gap-2 rounded-none"><Plus size={16} /> Novo</Button>
      </div>

      {editing && (
        <div className="border border-border p-6 space-y-4 bg-secondary/30">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === "textarea"
                ? <Textarea rows={3} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                : <Input value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />}
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={save} className="rounded-none">Salvar</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-none">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="divide-y border-y border-border">
        {items.length === 0 && <div className="py-8 text-muted-foreground italic">Nenhum item ainda.</div>}
        {items.map((it: any, i) => (
          <div key={it.id} className="py-4 flex items-center gap-3">
            <div className="flex flex-col">
              <button onClick={() => move(it, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => move(it, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown size={14} /></button>
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => startEdit(it)}>
              <div className="font-medium">{it[fields[0].key]}</div>
              <div className="text-sm text-muted-foreground">{it[fields[1]?.key]}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 size={16} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};
