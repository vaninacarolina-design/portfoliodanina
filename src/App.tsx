import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import Index from "./pages/Index";
import Projetos from "./pages/Projetos";
import ProjetoDetalhe from "./pages/ProjetoDetalhe";
import Contato from "./pages/Contato";
import AtuacaoSocial from "./pages/AtuacaoSocial";
import Sobre from "./pages/Sobre";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjetos from "./pages/admin/AdminProjetos";
import AdminProjetoEditor from "./pages/admin/AdminProjetoEditor";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminContato from "./pages/admin/AdminContato";
import { AdminFormacoes, AdminExperiencias, AdminVoluntariados } from "./pages/admin/AdminLists";
import AdminSobre from "./pages/admin/AdminSobre";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/projetos" element={<Projetos />} />
                <Route path="/projetos/:slug" element={<ProjetoDetalhe />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/atuacao-social" element={<AtuacaoSocial />} />
                <Route path="/contato" element={<Contato />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="projetos" element={<AdminProjetos />} />
                <Route path="projetos/:id" element={<AdminProjetoEditor />} />
                <Route path="configuracoes" element={<AdminConfig />} />
                <Route path="sobre" element={<AdminSobre />} />
                <Route path="contato" element={<AdminContato />} />
                <Route path="formacoes" element={<AdminFormacoes />} />
                <Route path="experiencias" element={<AdminExperiencias />} />
                <Route path="voluntariados" element={<AdminVoluntariados />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
