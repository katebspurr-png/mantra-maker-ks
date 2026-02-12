import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { MiniPlayer } from "@/components/MiniPlayer";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GlobalAudioProvider>
        <DemoProvider>
          <SessionManager />
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
          </BrowserRouter>
        </DemoProvider>
      </GlobalAudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
