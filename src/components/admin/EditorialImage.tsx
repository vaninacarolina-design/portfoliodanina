import { useState } from "react";
import { uploadMedia } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Plus, Move, Maximize2 } from "lucide-react";

export type ImgItem = {
  url: string;
  posX?: number;   // 0..100 (object-position-x)
  posY?: number;   // 0..100 (object-position-y)
  fit?: "cover" | "contain";
  ratio?: "auto" | "1:1" | "4:5" | "3:4" | "16:9" | "21:9";
  size?: "s" | "m" | "l" | "xl";
};

export const normalizeItem = (it: any): ImgItem => {
  if (!it) return { url: "" };
  if (typeof it === "string") return { url: it, posX: 50, posY: 50, fit: "cover", ratio: "auto", size: "m" };
  return {
    url: it.url ?? "",
    posX: typeof it.posX === "number" ? it.posX : 50,
    posY: typeof it.posY === "number" ? it.posY : 50,
    fit: it.fit ?? "cover",
    ratio: it.ratio ?? "auto",
    size: it.size ?? "m",
  };
};

const RATIOS: ImgItem["ratio"][] = ["auto", "1:1", "4:5", "3:4", "16:9", "21:9"];
const SIZES: { v: NonNullable<ImgItem["size"]>; label: string }[] = [
  { v: "s", label: "P" }, { v: "m", label: "M" }, { v: "l", label: "G" }, { v: "xl", label: "XG" },
];

const ratioStyle = (r?: string) => {
  if (!r || r === "auto") return undefined;
  const [a, b] = r.split(":").map(Number);
  return { aspectRatio: `${a} / ${b}` } as React.CSSProperties;
};

interface SingleProps {
  value: ImgItem | string | null;
  onChange: (v: ImgItem | null) => void;
  folder?: string;
  label?: string;
}

export const EditorialImageSingle = ({ value, onChange, folder = "uploads", label = "Imagem" }: SingleProps) => {
  const item = value ? normalizeItem(value) : null;
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange({ url, posX: 50, posY: 50, fit: "cover", ratio: "auto", size: "m" });
      toast.success("Imagem enviada");
    } catch (err: any) { toast.error(err.message || "Erro no upload"); }
    finally { setBusy(false); e.target.value = ""; }
  };

  if (!item || !item.url) {
    return (
      <label className="inline-block">
        <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={busy} />
        <Button type="button" variant="outline" size="sm" disabled={busy} className="gap-2 cursor-pointer pointer-events-none">
          <Upload size={14} /> {busy ? "Enviando…" : label}
        </Button>
      </label>
    );
  }

  return <ItemEditor item={item} onChange={onChange} onRemove={() => onChange(null)} />;
};

interface GalleryProps {
  value: (ImgItem | string)[];
  onChange: (v: ImgItem[]) => void;
  folder?: string;
}

export const EditorialImageGallery = ({ value, onChange, folder = "galeria" }: GalleryProps) => {
  const items = (value || []).map(normalizeItem);
  const [busy, setBusy] = useState(false);

  const addFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = await Promise.all(files.map(async f => ({
        url: await uploadMedia(f, folder), posX: 50, posY: 50, fit: "cover" as const, ratio: "auto" as const, size: "m" as const,
      })));
      onChange([...items, ...uploaded]);
      toast.success(`${uploaded.length} imagem(ns) adicionada(s)`);
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); e.target.value = ""; }
  };

  const updateAt = (i: number, v: ImgItem | null) => {
    if (!v) onChange(items.filter((_, k) => k !== i));
    else onChange(items.map((it, k) => k === i ? v : it));
  };
  const move = (i: number, dir: -1 | 1) => {
    const ni = i + dir; if (ni < 0 || ni >= items.length) return;
    const arr = [...items]; [arr[i], arr[ni]] = [arr[ni], arr[i]]; onChange(arr);
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((it, i) => (
            <div key={i} className="border border-border bg-background p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>#{i + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} className="h-6 px-1.5">↑</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="h-6 px-1.5">↓</Button>
                </div>
              </div>
              <ItemEditor item={it} onChange={(v) => updateAt(i, v)} onRemove={() => updateAt(i, null)} compact />
            </div>
          ))}
        </div>
      )}
      <label>
        <input type="file" accept="image/*" multiple onChange={addFiles} className="hidden" disabled={busy} />
        <Button type="button" variant="outline" size="sm" disabled={busy} className="gap-2 cursor-pointer pointer-events-none">
          <Plus size={14} /> {busy ? "Enviando…" : "Adicionar imagens"}
        </Button>
      </label>
    </div>
  );
};

const ItemEditor = ({ item, onChange, onRemove, compact = false }: { item: ImgItem; onChange: (v: ImgItem) => void; onRemove: () => void; compact?: boolean }) => {
  const set = (k: keyof ImgItem, v: any) => onChange({ ...item, [k]: v });

  return (
    <div className="space-y-2">
      <div className="relative bg-secondary/40" style={ratioStyle(item.ratio)}>
        <div className="relative w-full h-full overflow-hidden border border-border" style={item.ratio === "auto" ? { maxHeight: 220 } : undefined}>
          <img src={item.url} alt=""
            className="w-full h-full"
            style={{
              objectFit: item.fit ?? "cover",
              objectPosition: `${item.posX ?? 50}% ${item.posY ?? 50}%`,
              maxHeight: item.ratio === "auto" ? 220 : undefined,
            }}
          />
        </div>
        <button type="button" onClick={onRemove}
          className="absolute -top-2 -right-2 bg-foreground text-background rounded-full p-1 hover:bg-destructive z-10">
          <X size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <Label className="text-[10px] uppercase tracking-wider flex items-center gap-1"><Move size={10} /> X {item.posX ?? 50}%</Label>
          <input type="range" min={0} max={100} value={item.posX ?? 50} onChange={e => set("posX", Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider flex items-center gap-1"><Move size={10} /> Y {item.posY ?? 50}%</Label>
          <input type="range" min={0} max={100} value={item.posY ?? 50} onChange={e => set("posY", Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <select value={item.ratio ?? "auto"} onChange={e => set("ratio", e.target.value)}
          className="border border-input bg-background px-1.5 py-1 rounded-sm">
          {RATIOS.map(r => <option key={r} value={r!}>{r === "auto" ? "Proporção orig." : r}</option>)}
        </select>
        <select value={item.fit ?? "cover"} onChange={e => set("fit", e.target.value as any)}
          className="border border-input bg-background px-1.5 py-1 rounded-sm" title="Encaixe">
          <option value="cover">Preencher (cortar)</option>
          <option value="contain">Caber inteira</option>
        </select>
        {!compact && (
          <div className="inline-flex border border-input rounded-sm overflow-hidden">
            {SIZES.map(s => (
              <button key={s.v} type="button" onClick={() => set("size", s.v)}
                className={`px-2 py-1 ${item.size === s.v ? "bg-foreground text-background" : "bg-background hover:bg-secondary"}`}
                title={`Tamanho ${s.label}`}>{s.label}</button>
            ))}
          </div>
        )}
        {compact && (
          <select value={item.size ?? "m"} onChange={e => set("size", e.target.value as any)}
            className="border border-input bg-background px-1.5 py-1 rounded-sm" title="Tamanho no grid">
            {SIZES.map(s => <option key={s.v} value={s.v}>Tam. {s.label}</option>)}
          </select>
        )}
      </div>
    </div>
  );
};
