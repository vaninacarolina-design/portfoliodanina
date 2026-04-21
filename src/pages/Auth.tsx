import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (mode === "signup") toast.success("Conta criada. Verifique seu email se necessário e faça login.");
    else nav("/admin");
  };

  return (
    <>
      <Helmet><title>Acesso restrito · Vanina Carolina</title></Helmet>
      <section className="min-h-[80vh] flex items-center">
        <div className="container-editorial grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-eyebrow mb-6">— Área restrita</div>
            <h1 className="text-display-lg">{mode === "signin" ? "Entrar" : "Criar conta"}</h1>
            <p className="mt-6 text-muted-foreground max-w-md">
              Acesso ao painel de gestão de conteúdo do portfólio.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5 max-w-md w-full">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="pwd">Senha</Label>
              <Input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </div>
            <Button type="submit" disabled={busy} className="w-full h-12 rounded-none">
              {busy ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="text-muted-foreground hover-underline">
                {mode === "signin" ? "Não tem conta? Criar" : "Já tem conta? Entrar"}
              </button>
              <Link to="/" className="text-muted-foreground hover-underline">← Voltar ao site</Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
export default Auth;
