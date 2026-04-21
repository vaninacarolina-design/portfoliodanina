import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

const AdminConfig = () => {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["site_settings_admin"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  if (!form) return <div className="text-muted-foreground">Carregando…</div>;

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      hero_name: form.hero_name, hero_subtitle: form.hero_subtitle, hero_intro: form.hero_intro,
      hero_image_url: form.hero_image_url, about_text: form.about_text,
    }).eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo! Site atualizado.");
    refetch();
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings_contact"] });
  };

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
        <Label htmlFor="n">Nome em destaque</Label>
        <Input id="n" value={form.hero_name} onChange={e => set("hero_name", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="sub">Subtítulo curto</Label>
        <Input id="sub" value={form.hero_subtitle} onChange={e => set("hero_subtitle", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="intro">Texto de apresentação (Hero)</Label>
        <Textarea id="intro" rows={4} value={form.hero_intro} onChange={e => set("hero_intro", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="about">Texto da seção Sobre</Label>
        <Textarea id="about" rows={6} value={form.about_text} onChange={e => set("about_text", e.target.value)} />
      </div>

      <Button onClick={save} disabled={saving} className="rounded-none">{saving ? "Salvando…" : "Salvar alterações"}</Button>
    </div>
  );
};
export default AdminConfig;
