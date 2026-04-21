import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const AdminContato = () => {
  const { data, refetch } = useQuery({
    queryKey: ["site_settings_contact"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });
  const [f, setF] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!f) return null;
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      contact_intro: f.contact_intro, whatsapp_number: f.whatsapp_number, whatsapp_display: f.whatsapp_display,
      email: f.email, social_instagram: f.social_instagram, social_linkedin: f.social_linkedin, social_behance: f.social_behance,
    }).eq("id", f.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo!"); refetch();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-4xl mb-2">Contato</h1>
        <p className="text-muted-foreground">Informações da página de contato.</p>
      </div>
      <div><Label>Texto de convite</Label><Textarea rows={3} value={f.contact_intro} onChange={e => set("contact_intro", e.target.value)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>WhatsApp (somente números, com DDI)</Label><Input value={f.whatsapp_number} onChange={e => set("whatsapp_number", e.target.value)} placeholder="5541999288087" /></div>
        <div><Label>WhatsApp (formato exibido)</Label><Input value={f.whatsapp_display} onChange={e => set("whatsapp_display", e.target.value)} /></div>
      </div>
      <div><Label>Email (opcional)</Label><Input value={f.email ?? ""} onChange={e => set("email", e.target.value || null)} /></div>
      <div><Label>Instagram URL</Label><Input value={f.social_instagram ?? ""} onChange={e => set("social_instagram", e.target.value || null)} /></div>
      <div><Label>LinkedIn URL</Label><Input value={f.social_linkedin ?? ""} onChange={e => set("social_linkedin", e.target.value || null)} /></div>
      <div><Label>Behance URL</Label><Input value={f.social_behance ?? ""} onChange={e => set("social_behance", e.target.value || null)} /></div>
      <Button onClick={save} disabled={saving} className="rounded-none">{saving ? "Salvando…" : "Salvar"}</Button>
    </div>
  );
};
export default AdminContato;
