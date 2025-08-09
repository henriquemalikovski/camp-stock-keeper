import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Inventory from "./pages/Inventory";
import CadastroItem from "./pages/CadastroItem";
import SolicitarItem from "./pages/SolicitarItem";
import Auth from "./pages/Auth";
import AdminSolicitacoes from "./pages/AdminSolicitacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/cadastro" element={<CadastroItem />} />
            <Route path="/solicitar" element={<SolicitarItem />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/solicitacoes" element={<AdminSolicitacoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
