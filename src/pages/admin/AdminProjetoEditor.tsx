import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichEditor } from "@/components/admin/RichEditor";
import { uploadMedia } from "@/lib/upload";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const AdminProjetoEditor = () => {
  const { id } = useParams();
  const isNew = id === "novo" || !id;
  const nav = useNavigate();
  const [f, setF] = useState<any>({
    titulo: "", slug: "", subtitulo: "", categoria: "", descricao_curta: "", conteudo: "",
    cover_url: null, video_url: "", galeria: [], cliente: "", papel: "", periodo: "",
    publicado: false, ordem: 0,
  });
  const [busy, setBusy] = useState(false);
  const [galBusy, setGalBusy] = useState(false);

  useQuery({
    queryKey: ["projeto_edit", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data } = await supabase.from("projetos").select("*").eq("id", id!).maybeSingle();
      if (data) setF({ ...data, galeria: Array.isArray(data.galeria) ? data.galeria : [] });
      return data;
    },
  });

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async (publish?: boolean) => {
    if (!f.titulo) return toast.error("Informe o título");
    setBusy(true);
    const slug = f.slug || slugify(f.titulo);
    const payload = {
      titulo: f.titulo, slug, subtitulo: f.subtitulo, categoria: f.categoria,
      descricao_curta: f.descricao_curta, conteudo: f.conteudo, cover_url: f.cover_url,
      video_url: f.video_url || null, galeria: f.galeria, cliente: f.cliente, papel: f.papel,
      periodo: f.periodo, publicado: publish ?? f.publicado, ordem: f.ordem ?? 0,
    };
    if (isNew) {
      const { data, error } = await supabase.from("projetos").insert(payload).select().single();
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Projeto criado!");
      qc.invalidateQueries({ queryKey: ["projetos_admin"] });
      qc.invalidateQueries({ queryKey: ["projetos_all"] });
      qc.invalidateQueries({ queryKey: ["projetos_home"] });
      nav(`/admin/projetos/${data.id}`);
    } else {
      const { error } = await supabase.from("projetos").update(payload).eq("id", id!);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success(publish ? "Publicado! Site atualizado." : "Salvo! Site atualizado.");
      if (publish !== undefined) set("publicado", publish);
      qc.invalidateQueries({ queryKey: ["projetos_admin"] });
      qc.invalidateQueries({ queryKey: ["projetos_all"] });
      qc.invalidateQueries({ queryKey: ["projetos_home"] });
      qc.invalidateQueries({ queryKey: ["projeto", f.slug] });
    }
  };

  const addGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setGalBusy(true);
    try {
      const urls = await Promise.all(files.map(file => uploadMedia(file, "galeria")));
      set("galeria", [...(f.galeria || []), ...urls]);
      toast.success(`${urls.length} adicionados`);
    } catch (err: any) { toast.error(err.message); }
    finally { setGalBusy(false); e.target.value = ""; }
  };
  const removeGaleria = (i: number) => set("galeria", f.galeria.filter((_: any, k: number) => k !== i));

  return (
    <div className="space-y-8 max-w-4xl">
      <Link to="/admin/projetos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Voltar
      </Link>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <h1 className="font-display text-4xl">{isNew ? "Novo projeto" : "Editar projeto"}</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">{f.publicado ? "Publicado" : "Rascunho"}</span>
          <Switch checked={f.publicado} onCheckedChange={v => set("publicado", v)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><Label>Título *</Label><Input value={f.titulo} onChange={e => set("titulo", e.target.value)} /></div>
        <div><Label>Slug (URL)</Label><Input value={f.slug} onChange={e => set("slug", slugify(e.target.value))} placeholder="auto a partir do título" /></div>
        <div><Label>Categoria</Label><Input value={f.categoria} onChange={e => set("categoria", e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Subtítulo</Label><Input value={f.subtitulo} onChange={e => set("subtitulo", e.target.value)} /></div>
        <div><Label>Cliente</Label><Input value={f.cliente} onChange={e => set("cliente", e.target.value)} /></div>
        <div><Label>Meu papel</Label><Input value={f.papel} onChange={e => set("papel", e.target.value)} /></div>
        <div><Label>Período</Label><Input value={f.periodo} onChange={e => set("periodo", e.target.value)} placeholder="2024" /></div>
        <div><Label>Vídeo (URL YouTube/Vimeo ou upload)</Label><Input value={f.video_url ?? ""} onChange={e => set("video_url", e.target.value)} placeholder="https://…" /></div>
      </div>

      <div>
        <Label>Imagem de capa</Label>
        <div className="mt-2"><ImageUpload value={f.cover_url} onChange={v => set("cover_url", v)} folder="capas" /></div>
      </div>

      <div>
        <Label>Descrição curta</Label>
        <Textarea rows={2} value={f.descricao_curta ?? ""} onChange={e => set("descricao_curta", e.target.value)} />
      </div>

      <div>
        <Label>Conteúdo do projeto</Label>
        <div className="mt-2"><RichEditor value={f.conteudo ?? ""} onChange={v => set("conteudo", v)} placeholder="Conte a história do projeto…" /></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Galeria de mídia</Label>
          <label>
            <input type="file" accept="image/*" multiple onChange={addGaleria} className="hidden" disabled={galBusy} />
            <Button type="button" variant="outline" size="sm" disabled={galBusy} className="gap-2 pointer-events-none cursor-pointer">
              <Plus size={14} /> {galBusy ? "Enviando…" : "Adicionar imagens"}
            </Button>
          </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(f.galeria || []).map((url: string, i: number) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-full aspect-square object-cover border border-border" />
              <button onClick={() => removeGaleria(i)} className="absolute top-2 right-2 bg-foreground text-background p-1 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-background py-4 border-t border-border">
        <Button onClick={() => save()} disabled={busy} className="rounded-none">{busy ? "Salvando…" : "Salvar rascunho"}</Button>
        <Button onClick={() => save(true)} disabled={busy} variant="outline" className="rounded-none">Salvar e publicar</Button>
      </div>
    </div>
  );
};
export default AdminProjetoEditor;
