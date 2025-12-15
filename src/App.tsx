import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { SessionManager } from "@/components/SessionManager";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GlobalAudioProvider>
        <SessionManager />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MiniPlayer />
        </BrowserRouter>
      </GlobalAudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

