import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/admin/RichEditor";
import { RichEditorMini } from "@/components/admin/RichEditorMini";
import { EditorialImageSingle } from "@/components/admin/EditorialImage";
import { SkillsComposition } from "@/components/site/SkillsComposition";
import { newSkillsBlock, type SkillsHeader, type SkillsBlock } from "@/lib/skills-composition";
import { ArrowUp, ArrowDown, Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export const SkillsPageEditor = () => {
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [header, setHeader] = useState<SkillsHeader>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!settings || dirty) return;
    const h = settings.page_headers?.skills as SkillsHeader | undefined;
    setHeader({ eyebrow: h?.eyebrow ?? "— Habilidades", titulo: h?.titulo ?? "Skills &amp; <em>ferramentas</em>", subtitulo: h?.subtitulo ?? settings.skills_intro ?? "", blocos: h?.blocos ?? [] });
  }, [settings, dirty]);
  const change = (patch: Partial<SkillsHeader>) => { setDirty(true); setHeader(h => ({ ...h, ...patch })); };
  const blocks = header.blocos ?? [];
  const updateBlock = (id: string, patch: Partial<SkillsBlock>) => change({ blocos: blocks.map(b => b.id === id ? { ...b, ...patch } : b) });
  const move = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    change({ blocos: next });
  };
  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { data, error: readError } = await supabase.from("site_settings").select("page_headers").eq("id", settings.id).single();
      if (readError) throw readError;
      const previous = (data?.page_headers ?? {}) as Record<string, unknown>;
      const { error } = await supabase.from("site_settings").update({ page_headers: { ...previous, skills: header } as any }).eq("id", settings.id);
      if (error) throw error;
      setDirty(false);
      await Promise.all(["site_settings", "site_settings_admin"].map(key => qc.invalidateQueries({ queryKey: [key] })));
      toast.success("Página Skills salva! Site atualizado.");
    } catch { toast.error("Não foi possível salvar a página Skills. Tente novamente."); }
    finally { setSaving(false); }
  };
  return (
    <section className="space-y-6 border-y border-border py-6">
      <h2 className="font-display text-2xl">Título, textos e fotos da página</h2>
      <div className="space-y-4">
        <div><Label>Texto acima do título</Label><RichEditorMini value={header.eyebrow ?? ""} onChange={v => change({ eyebrow: v })} /></div>
        <div><Label>Título da página</Label><RichEditorMini value={header.titulo ?? ""} onChange={v => change({ titulo: v })} /></div>
        <div><Label>Texto de apresentação</Label><RichEditor value={header.subtitulo ?? ""} onChange={v => change({ subtitulo: v })} /></div>
      </div>
      {blocks.map((b, i) => (
        <div key={b.id} className="border border-border p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Label>{i + 1} · {({ titulo: "Título", texto: "Texto", imagem: "Foto", par: "Foto e texto" })[b.tipo]}</Label>
            <div className="flex shrink-0">
              <Button size="icon" variant="ghost" title="Mover para cima" aria-label="Mover para cima" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></Button>
              <Button size="icon" variant="ghost" title="Mover para baixo" aria-label="Mover para baixo" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></Button>
              <Button size="icon" variant="ghost" title="Excluir bloco" aria-label="Excluir bloco" onClick={() => change({ blocos: blocks.filter(x => x.id !== b.id) })}><Trash2 size={16} /></Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs space-y-1">Largura<select aria-label="Largura" className="block border border-input bg-background p-2 text-sm" value={b.largura} onChange={e => updateBlock(b.id, { largura: e.target.value as SkillsBlock["largura"] })}><option value="estreita">Estreita</option><option value="media">Média</option><option value="total">Toda a largura</option></select></label>
            <label className="text-xs space-y-1">Posição<select aria-label="Posição" className="block border border-input bg-background p-2 text-sm" value={b.posicao} onChange={e => updateBlock(b.id, { posicao: e.target.value as SkillsBlock["posicao"] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
            {b.tipo === "par" && <>
              <label className="text-xs space-y-1">Foto<select aria-label="Lado da foto" className="block border border-input bg-background p-2 text-sm" value={b.lado} onChange={e => updateBlock(b.id, { lado: e.target.value as SkillsBlock["lado"] })}><option value="left">À esquerda</option><option value="right">À direita</option></select></label>
              <label className="text-xs space-y-1">Altura do texto<select aria-label="Altura do texto" className="block border border-input bg-background p-2 text-sm" value={b.vertical} onChange={e => updateBlock(b.id, { vertical: e.target.value as SkillsBlock["vertical"] })}><option value="start">Topo</option><option value="center">Centro</option><option value="end">Base</option></select></label>
            </>}
          </div>
          {(b.tipo === "imagem" || b.tipo === "par") && <EditorialImageSingle value={b.img} onChange={img => updateBlock(b.id, { img })} folder="skills" label="Adicionar sua foto" />}
          {b.tipo !== "imagem" && <RichEditor value={b.html} onChange={html => updateBlock(b.id, { html })} />}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {(["titulo", "texto", "imagem", "par"] as const).map(tipo => <Button key={tipo} variant="outline" size="sm" onClick={() => change({ blocos: [...blocks, newSkillsBlock(tipo)] })} className="gap-2"><Plus size={14} />{({ titulo: "Título", texto: "Texto", imagem: "Foto", par: "Foto e texto" })[tipo]}</Button>)}
      </div>
      {blocks.length > 0 && <details className="border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium">Prévia da composição</summary><div className="pt-6"><SkillsComposition blocks={blocks} /></div></details>}
      <Button className="gap-2" onClick={save} disabled={saving || !settings}><Save size={16} />{saving ? "Salvando…" : "Salvar página Skills"}</Button>
    </section>
  );
};