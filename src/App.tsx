import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PendingVoteProvider } from "@/hooks/usePendingVote";
import { DevModeProvider } from "@/hooks/useDevMode";
import PendingVoteHandler from "@/components/PendingVoteHandler";
import LoginScreen from "@/components/LoginScreen";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import RutaPage from "./pages/RutaPage";
import RutaDetailPage from "./pages/RutaDetailPage";
import VotarPage from "./pages/VotarPage";
import PasaportePage from "./pages/PasaportePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Component that handles auth-gated routing
const AuthGatedApp = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* QR voting flow - always accessible (lazy auth) */}
        <Route path="/votar/:venueId" element={<VotarPage />} />

        {/* If not authenticated, show login for all other routes */}
        {!user ? (
          <>
            <Route path="*" element={<LoginScreen />} />
          </>
        ) : (
          <>
            {/* Authenticated routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/ruta/:slug" element={<RutaDetailPage />} />

            {/* Routes with bottom navigation */}
            <Route element={<AppLayout />}>
              <Route path="/explorar" element={<RutaPage />} />
              <Route path="/pasaporte" element={<PasaportePage />} />
              <Route path="/ranking" element={<RankingPage />} />
            </Route>

            {/* Admin route - AdminPage handles role check internally */}
            <Route path="/admin" element={<AdminPage />} />

            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PendingVoteProvider>
        <DevModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PendingVoteHandler />
            <AuthGatedApp />
          </TooltipProvider>
        </DevModeProvider>
      </PendingVoteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
