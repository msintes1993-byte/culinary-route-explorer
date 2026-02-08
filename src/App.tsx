import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PendingVoteProvider } from "@/hooks/usePendingVote";
import { DevModeProvider } from "@/hooks/useDevMode";
import PendingVoteHandler from "@/components/PendingVoteHandler";
import AppLayout from "./components/AppLayout";
import RutaPage from "./pages/RutaPage";
import PasaportePage from "./pages/PasaportePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PendingVoteProvider>
        <DevModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PendingVoteHandler />
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<RutaPage />} />
                  <Route path="/pasaporte" element={<PasaportePage />} />
                  <Route path="/ranking" element={<RankingPage />} />
                </Route>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DevModeProvider>
      </PendingVoteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
