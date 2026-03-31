import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { ImmersivePlayerProvider } from "@/contexts/ImmersivePlayerContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { ImmersivePlayer } from "@/components/ImmersivePlayer";
import { SessionManager } from "@/components/SessionManager";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import NewRecording from "./pages/NewRecording";
import RecordingDetail from "./pages/RecordingDetail";
import Library from "./pages/Library";
import ThoughtRewriter from "./pages/ThoughtRewriter";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Profile from "./pages/Profile";
import AffirmationDetail from "./pages/AffirmationDetail";
import AffirmationsList from "./pages/AffirmationsList";
import Progress from "./pages/Progress";
import DemoApp from "./pages/DemoApp";
import NotFound from "./pages/NotFound";
import { themePresets, ThemeId } from "@/hooks/useColorTheme";

// Apply saved theme immediately on load
function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = (localStorage.getItem("loop-color-theme") as ThemeId) || "calm";
    const preset = themePresets.find((t) => t.id === savedTheme);
    if (preset) {
      const isDark = document.documentElement.classList.contains("dark");
      const vars = isDark ? preset.dark : preset.light;
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, []);
  return null;
}

const queryClient = new QueryClient();

/**
 * Catches PASSWORD_RECOVERY auth events globally and redirects to /reset-password.
 * This prevents the recovery link from acting like a magic sign-in link.
 */
function RecoveryRedirect() {
  useEffect(() => {
    // Check URL hash on mount – Supabase recovery links contain type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      // Ensure we're on the reset-password page
      if (!window.location.pathname.includes("/reset-password")) {
        window.location.replace("/reset-password" + hash);
        return;
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        if (!window.location.pathname.includes("/reset-password")) {
          window.location.replace("/reset-password");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GlobalAudioProvider>
        <ImmersivePlayerProvider>
        <DemoProvider>
          <SessionManager />
          <ThemeInitializer />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/new-recording" element={<NewRecording />} />
              <Route path="/recording/:id" element={<RecordingDetail />} />
              <Route path="/library" element={<Library />} />
              <Route path="/thought-rewriter" element={<ThoughtRewriter />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/affirmation/:affirmationId" element={<AffirmationDetail />} />
              <Route path="/affirmations" element={<AffirmationsList />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/demo" element={<DemoApp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniPlayer />
            <ImmersivePlayer />
          </BrowserRouter>
        </DemoProvider>
        </ImmersivePlayerProvider>
      </GlobalAudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
