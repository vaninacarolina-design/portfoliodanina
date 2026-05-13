import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/admin/RichEditor";
import { RichEditorMini } from "@/components/admin/RichEditorMini";
import { EditorialImageSingle, EditorialImageGallery } from "@/components/admin/EditorialImage";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Type, Quote, Image as ImageIcon, Columns2, LayoutGrid, Minus, AtSign, X } from "lucide-react";

type Bloco = any;

const TYPES = [
  { v: "texto", label: "Texto", icon: Type },
  { v: "frase", label: "Frase grande", icon: Quote },
  { v: "imagem", label: "Imagem", icon: ImageIcon },
  { v: "par", label: "Texto + Imagem", icon: Columns2 },
  { v: "galeria", label: "Galeria", icon: LayoutGrid },
  { v: "redes", label: "Redes sociais", icon: AtSign },
  { v: "espaco", label: "Espaço", icon: Minus },
];

const PLATAFORMAS = ["instagram", "linkedin", "behance", "youtube", "facebook", "tiktok", "spotify", "email", "site", "outro"];

const newBlock = (tipo: string): Bloco => {
  const id = crypto.randomUUID();
  switch (tipo) {
    case "texto": return { id, tipo, html: "", align: "left" };
    case "frase": return { id, tipo, html: "" };
    case "imagem": return { id, tipo, img: null, legenda: "" };
    case "par": return { id, tipo, lado: "esquerda", img: null, html: "" };
    case "galeria": return { id, tipo, itens: [] };
    case "redes": return { id, tipo, itens: [], align: "center" };
    case "espaco": return { id, tipo, altura: "m" };
    default: return { id, tipo };
  }
};

const AdminSobre = () => {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["site_settings_sobre"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setBlocos(Array.isArray((data as any).sobre_blocos) ? (data as any).sobre_blocos : []);
      setHero((data as any).sobre_hero ?? null);
    }
  }, [data]);

  const update = (i: number, patch: Partial<Bloco>) =>
    setBlocos(b => b.map((x, k) => k === i ? { ...x, ...patch } : x));
  const remove = (i: number) => setBlocos(b => b.filter((_, k) => k !== i));
  const move = (i: number, dir: -1 | 1) => {
    const ni = i + dir; if (ni < 0 || ni >= blocos.length) return;
    const arr = [...blocos]; [arr[i], arr[ni]] = [arr[ni], arr[i]]; setBlocos(arr);
  };
  const add = (tipo: string) => setBlocos([...blocos, newBlock(tipo)]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      sobre_blocos: blocos as any,
      sobre_hero: hero as any,
    } as any).eq("id", (data as any).id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Página Sobre atualizada");
    refetch();
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-4xl mb-2">Sobre Mim</h1>
        <p className="text-muted-foreground">Composição editorial livre: combine fotos, textos, frases grandes e galerias.</p>
      </div>

      <div className="border border-border p-6 space-y-3 bg-secondary/30">
        <Label className="text-base">Imagem de capa (Hero)</Label>
        <p className="text-xs text-muted-foreground">Aparece no topo da página, com controle de recorte e posição.</p>
        <EditorialImageSingle value={hero} onChange={setHero} folder="sobre" label="Enviar imagem de capa" />
      </div>

      <div className="space-y-4">
        {blocos.map((b, i) => (
          <div key={b.id || i} className="border border-border p-5 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                #{i + 1} · {TYPES.find(t => t.v === b.tipo)?.label || b.tipo}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === blocos.length - 1}><ChevronDown size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 size={14} /></Button>
              </div>
            </div>

            {b.tipo === "texto" && (
              <>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => update(i, { align: "left" })}
                    className={`px-2 py-1 border ${b.align !== "center" ? "bg-foreground text-background border-foreground" : "border-input"}`}>Esquerda</button>
                  <button type="button" onClick={() => update(i, { align: "center" })}
                    className={`px-2 py-1 border ${b.align === "center" ? "bg-foreground text-background border-foreground" : "border-input"}`}>Centralizado</button>
                </div>
                <RichEditor value={b.html || ""} onChange={v => update(i, { html: v })} />
              </>
            )}
            {b.tipo === "frase" && (
              <>
                <p className="text-xs text-muted-foreground">Frase de impacto exibida em tamanho display.</p>
                <RichEditorMini value={b.html || ""} onChange={v => update(i, { html: v })} placeholder="Sua frase…" />
              </>
            )}
            {b.tipo === "imagem" && (
              <>
                <EditorialImageSingle value={b.img} onChange={v => update(i, { img: v })} folder="sobre" />
                <div>
                  <Label className="text-xs">Legenda (opcional)</Label>
                  <Input value={b.legenda || ""} onChange={e => update(i, { legenda: e.target.value })} placeholder="Legenda" />
                </div>
              </>
            )}
            {b.tipo === "par" && (
              <>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => update(i, { lado: "esquerda" })}
                    className={`px-2 py-1 border ${b.lado !== "direita" ? "bg-foreground text-background border-foreground" : "border-input"}`}>Imagem à esquerda</button>
                  <button type="button" onClick={() => update(i, { lado: "direita" })}
                    className={`px-2 py-1 border ${b.lado === "direita" ? "bg-foreground text-background border-foreground" : "border-input"}`}>Imagem à direita</button>
                </div>
                <EditorialImageSingle value={b.img} onChange={v => update(i, { img: v })} folder="sobre" />
                <RichEditor value={b.html || ""} onChange={v => update(i, { html: v })} placeholder="Texto ao lado da imagem…" />
              </>
            )}
            {b.tipo === "galeria" && (
              <EditorialImageGallery value={b.itens || []} onChange={v => update(i, { itens: v })} folder="sobre" />
            )}
            {b.tipo === "espaco" && (
              <div className="flex gap-2 text-xs">
                {(["s", "m", "l"] as const).map(h => (
                  <button key={h} type="button" onClick={() => update(i, { altura: h })}
                    className={`px-3 py-1.5 border ${b.altura === h ? "bg-foreground text-background border-foreground" : "border-input"}`}>
                    {h === "s" ? "Pequeno" : h === "m" ? "Médio" : "Grande"}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {blocos.length === 0 && (
          <div className="border border-dashed border-border p-10 text-center text-muted-foreground italic">
            Nenhum bloco ainda. Adicione abaixo para começar a compor.
          </div>
        )}
      </div>

      <div className="border border-border p-4 space-y-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Adicionar bloco</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <Button key={t.v} variant="outline" size="sm" onClick={() => add(t.v)} className="gap-2 rounded-none">
              <t.icon size={14} /> {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background py-4 border-t border-border">
        <Button onClick={save} disabled={saving} className="rounded-none gap-2">
          <Plus size={14} /> {saving ? "Salvando…" : "Salvar página Sobre"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSobre;
