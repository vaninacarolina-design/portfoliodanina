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
import { RichEditorMini } from "@/components/admin/RichEditorMini";
import { EditorialImageGallery } from "@/components/admin/EditorialImage";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const stripHtml = (s: string) => (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const slugify = (s: string) => stripHtml(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const AdminProjetoEditor = () => {
  const { id } = useParams();
  const isNew = id === "novo" || !id;
  const nav = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState<any>({
    titulo: "", slug: "", subtitulo: "", categoria: "", descricao_curta: "", conteudo: "",
    cover_url: null, video_url: "", galeria: [], cliente: "", papel: "", periodo: "",
    publicado: false, ordem: 0,
  });
  const [busy, setBusy] = useState(false);

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
    if (!stripHtml(f.titulo)) return toast.error("Informe o título");
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
        <div className="md:col-span-2"><Label>Título *</Label><div className="mt-1.5"><RichEditorMini value={f.titulo} onChange={v => set("titulo", v)} placeholder="Título do projeto" /></div></div>
        <div><Label>Slug (URL)</Label><Input value={f.slug} onChange={e => set("slug", slugify(e.target.value))} placeholder="auto a partir do título" /></div>
        <div><Label>Categoria</Label><div className="mt-1.5"><RichEditorMini value={f.categoria} onChange={v => set("categoria", v)} placeholder="Branding, Editorial…" /></div></div>
        <div className="md:col-span-2"><Label>Subtítulo</Label><div className="mt-1.5"><RichEditorMini value={f.subtitulo} onChange={v => set("subtitulo", v)} placeholder="Subtítulo" /></div></div>
        <div><Label>Cliente</Label><div className="mt-1.5"><RichEditorMini value={f.cliente} onChange={v => set("cliente", v)} /></div></div>
        <div><Label>Meu papel</Label><div className="mt-1.5"><RichEditorMini value={f.papel} onChange={v => set("papel", v)} /></div></div>
        <div><Label>Período</Label><div className="mt-1.5"><RichEditorMini value={f.periodo} onChange={v => set("periodo", v)} placeholder="2024" /></div></div>
        <div><Label>Vídeo (URL YouTube/Vimeo ou upload)</Label><Input value={f.video_url ?? ""} onChange={e => set("video_url", e.target.value)} placeholder="https://…" /></div>
      </div>

      <div>
        <Label>Imagem de capa</Label>
        <div className="mt-2"><ImageUpload value={f.cover_url} onChange={v => set("cover_url", v)} folder="capas" /></div>
      </div>

      <div>
        <Label>Descrição curta</Label>
        <div className="mt-2"><RichEditor value={f.descricao_curta ?? ""} onChange={v => set("descricao_curta", v)} placeholder="Resumo curto do projeto…" /></div>
      </div>

      <div>
        <Label>Conteúdo do projeto</Label>
        <div className="mt-2"><RichEditor value={f.conteudo ?? ""} onChange={v => set("conteudo", v)} placeholder="Conte a história do projeto…" /></div>
      </div>

      <div>
        <Label>Galeria de mídia (recorte, posição e tamanho por imagem)</Label>
        <div className="mt-2">
          <EditorialImageGallery value={f.galeria || []} onChange={v => set("galeria", v)} folder="galeria" />
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
