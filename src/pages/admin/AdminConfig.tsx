import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichEditor } from "@/components/admin/RichEditor";
import { RichEditorMini } from "@/components/admin/RichEditorMini";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const AdminConfig = () => {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["site_settings_admin"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      const palavras = Array.isArray((data as any).marquee_palavras)
        ? (data as any).marquee_palavras
        : ["Estratégia", "Criatividade", "Gestão", "Impacto", "Design"];
      const headers = (data as any).page_headers && typeof (data as any).page_headers === "object"
        ? (data as any).page_headers : {};
      setForm({ ...data, marquee_palavras: palavras, page_headers: headers });
    }
  }, [data]);

  if (!form) return <div className="text-muted-foreground">Carregando…</div>;

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setHeader = (page: string, key: "eyebrow" | "titulo" | "subtitulo", v: string) =>
    setForm((f: any) => ({
      ...f,
      page_headers: { ...(f.page_headers || {}), [page]: { ...((f.page_headers || {})[page] || {}), [key]: v } },
    }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      hero_name: form.hero_name, hero_subtitle: form.hero_subtitle, hero_intro: form.hero_intro,
      hero_image_url: form.hero_image_url, about_text: form.about_text,
      marquee_palavras: form.marquee_palavras ?? [],
      page_headers: form.page_headers ?? {},
    } as any).eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo! Site atualizado.");
    refetch();
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings_contact"] });
  };

  const palavras: string[] = form.marquee_palavras || [];
  const updWord = (i: number, v: string) => set("marquee_palavras", palavras.map((p, k) => k === i ? v : p));
  const addWord = () => set("marquee_palavras", [...palavras, ""]);
  const rmWord = (i: number) => set("marquee_palavras", palavras.filter((_, k) => k !== i));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-4xl mb-2">Home & Sobre</h1>
        <p className="text-muted-foreground">Conteúdo da página inicial.</p>
      </div>

      <div>
        <Label>Foto de capa (Hero)</Label>
        <div className="mt-2">
          <ImageUpload value={form.hero_image_url} onChange={url => set("hero_image_url", url)} folder="hero" />
        </div>
      </div>

      <div>
        <Label>Nome em destaque</Label>
        <div className="mt-1.5"><RichEditorMini value={form.hero_name} onChange={v => set("hero_name", v)} placeholder="Seu nome" /></div>
      </div>

      <div>
        <Label>Subtítulo curto</Label>
        <div className="mt-1.5"><RichEditorMini value={form.hero_subtitle} onChange={v => set("hero_subtitle", v)} placeholder="Subtítulo" /></div>
      </div>

      <div>
        <Label>Texto de apresentação (Hero)</Label>
        <div className="mt-2"><RichEditor value={form.hero_intro ?? ""} onChange={v => set("hero_intro", v)} placeholder="Texto que aparece junto à sua foto…" /></div>
      </div>

      <div>
        <Label>Texto da seção Sobre</Label>
        <div className="mt-2"><RichEditor value={form.about_text ?? ""} onChange={v => set("about_text", v)} placeholder="Conte sobre você…" /></div>
      </div>

      <div className="border-t border-border pt-8">
        <Label className="text-base">Banner em movimento (palavras-chave)</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Palavras que aparecem rolando logo abaixo do hero. Ordem alternada (a 2ª, 4ª… ficam em itálico).
        </p>
        <div className="space-y-2">
          {palavras.map((w, i) => (
            <div key={i} className="flex gap-2">
              <Input value={w} onChange={e => updWord(i, e.target.value)} placeholder={`Palavra ${i + 1}`} />
              <Button type="button" variant="outline" size="icon" onClick={() => rmWord(i)} className="rounded-none">
                <X size={14} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addWord} className="gap-2 rounded-none">
            <Plus size={14} /> Adicionar palavra
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-8 space-y-6">
        <div>
          <Label className="text-base">Cabeçalhos das páginas</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Edite a tag pequena (eyebrow), o título grande e o subtítulo de cada página interna. Aceita formatação rica.
          </p>
        </div>
        {[
          { key: "projetos", label: "Projetos" },
          { key: "skills", label: "Skills" },
          { key: "atuacao-social", label: "Atuação Social" },
          { key: "sobre", label: "Sobre Mim" },
          { key: "contato", label: "Contato" },
        ].map(p => {
          const h = (form.page_headers || {})[p.key] || {};
          return (
            <div key={p.key} className="border border-border p-5 space-y-3 bg-secondary/20">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{p.label}</div>
              <div>
                <Label className="text-xs">Eyebrow (tag pequena)</Label>
                <div className="mt-1.5"><RichEditorMini value={h.eyebrow ?? ""} onChange={v => setHeader(p.key, "eyebrow", v)} placeholder="— Portfólio" /></div>
              </div>
              <div>
                <Label className="text-xs">Título</Label>
                <div className="mt-1.5"><RichEditorMini value={h.titulo ?? ""} onChange={v => setHeader(p.key, "titulo", v)} placeholder="Título grande" /></div>
              </div>
              <div>
                <Label className="text-xs">Subtítulo</Label>
                <div className="mt-1.5"><RichEditorMini value={h.subtitulo ?? ""} onChange={v => setHeader(p.key, "subtitulo", v)} placeholder="Texto introdutório" /></div>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={save} disabled={saving} className="rounded-none">{saving ? "Salvando…" : "Salvar alterações"}</Button>
    </div>
  );
};
export default AdminConfig;
