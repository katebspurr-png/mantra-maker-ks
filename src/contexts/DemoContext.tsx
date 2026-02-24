import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Recording, Playlist } from "@/types";

interface DemoContextType {
  isDemoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  demoRecordings: Recording[];
  demoPlaylists: (Playlist & { recordingIds: string[] })[];
  showSignupPrompt: (featureName?: string) => void;
  signupPromptOpen: boolean;
  signupFeature: string;
  closeSignupPrompt: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemoMode = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoProvider");
  return ctx;
};

export const useMaybeDemoMode = () => {
  return useContext(DemoContext);
};

const DEMO_RECORDINGS: Recording[] = [
  {
    id: "demo-1",
    user_id: "demo",
    title: "I am worthy of love and respect",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration_seconds: 12,
    audio_file_path: "",
    loop_mode: "infinite",
    is_favorite: true,
    is_best_take: true,
    tags: ["self-love"],
  },
  {
    id: "demo-2",
    user_id: "demo",
    title: "I trust my journey",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    duration_seconds: 8,
    audio_file_path: "",
    loop_mode: "three_times",
    is_favorite: false,
    is_best_take: false,
    tags: ["confidence"],
  },
  {
    id: "demo-3",
    user_id: "demo",
    title: "I am enough exactly as I am",
    created_at: new Date().toISOString(),
    duration_seconds: 10,
    audio_file_path: "",
    loop_mode: "infinite",
    is_favorite: true,
    is_best_take: true,
    tags: ["self-love"],
  },
  {
    id: "demo-4",
    user_id: "demo",
    title: "I am capable and strong",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    duration_seconds: 7,
    audio_file_path: "",
    loop_mode: "once",
    is_favorite: false,
    is_best_take: false,
    tags: ["confidence"],
  },
];

const DEMO_PLAYLISTS: (Playlist & { recordingIds: string[] })[] = [
  {
    id: "demo-playlist-1",
    user_id: "demo",
    title: "Morning Motivation",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    shuffle: false,
    delay_seconds: 2,
    loop_playlist: true,
    zen_enabled: false,
    zen_volume: 0.3,
    zen_ducking_intensity: 0.83,
    recordingIds: ["demo-1", "demo-3", "demo-4"],
  },
];

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [signupPromptOpen, setSignupPromptOpen] = useState(false);
  const [signupFeature, setSignupFeature] = useState("");

  const enterDemo = useCallback(() => setIsDemoMode(true), []);
  const exitDemo = useCallback(() => setIsDemoMode(false), []);

  const showSignupPrompt = useCallback((featureName = "this feature") => {
    setSignupFeature(featureName);
    setSignupPromptOpen(true);
  }, []);

  const closeSignupPrompt = useCallback(() => {
    setSignupPromptOpen(false);
    setSignupFeature("");
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        enterDemo,
        exitDemo,
        demoRecordings: DEMO_RECORDINGS,
        demoPlaylists: DEMO_PLAYLISTS,
        showSignupPrompt,
        signupPromptOpen,
        signupFeature,
        closeSignupPrompt,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
