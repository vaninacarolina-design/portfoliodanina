import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

export type ProjectLink = { label: string; url: string };

interface Props {
  value: ProjectLink[];
  onChange: (v: ProjectLink[]) => void;
}

export const LinksManager = ({ value, onChange }: Props) => {
  const links = Array.isArray(value) ? value : [];
  const update = (i: number, patch: Partial<ProjectLink>) =>
    onChange(links.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const add = () => onChange([...links, { label: "", url: "" }]);
  const remove = (i: number) => onChange(links.filter((_, k) => k !== i));
  const move = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= links.length) return;
    const arr = [...links];
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2 border border-border bg-background p-3">
              <div className="flex-1 min-w-[160px]">
                <Label className="text-[10px] uppercase tracking-wider">Nome do botão</Label>
                <Input value={l.label} onChange={e => update(i, { label: e.target.value })} placeholder="Ver vídeo" />
              </div>
              <div className="flex-[2] min-w-[200px]">
                <Label className="text-[10px] uppercase tracking-wider">Link</Label>
                <Input value={l.url} onChange={e => update(i, { url: e.target.value })} placeholder="https://…" />
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} className="h-9 px-2"><ArrowUp size={14} /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === links.length - 1} className="h-9 px-2"><ArrowDown size={14} /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="h-9 px-2 text-destructive"><X size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus size={14} /> Adicionar botão
      </Button>
    </div>
  );
};
