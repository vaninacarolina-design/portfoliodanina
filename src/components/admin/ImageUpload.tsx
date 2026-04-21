import { useState } from "react";
import { uploadMedia } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  folder?: string;
  label?: string;
}

export const ImageUpload = ({ value, onChange, accept = "image/*", folder = "uploads", label = "Enviar arquivo" }: Props) => {
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Arquivo enviado");
    } catch (err: any) {
      toast.error(err.message || "Erro no upload");
    } finally { setBusy(false); e.target.value = ""; }
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative inline-block">
          {value.match(/\.(mp4|webm|mov)$/i)
            ? <video src={value} className="max-h-48 border border-border" controls />
            : <img src={value} alt="" className="max-h-48 border border-border" />}
          <button type="button" onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-foreground text-background rounded-full p-1 hover:bg-destructive">
            <X size={14} />
          </button>
        </div>
      )}
      <label className="inline-block">
        <input type="file" accept={accept} onChange={onFile} className="hidden" disabled={busy} />
        <Button type="button" variant="outline" size="sm" disabled={busy} className="gap-2 cursor-pointer pointer-events-none">
          <Upload size={14} /> {busy ? "Enviando…" : label}
        </Button>
      </label>
    </div>
  );
};
