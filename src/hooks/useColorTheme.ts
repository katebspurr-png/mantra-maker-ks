import { useState, useEffect } from "react";

export type ThemeId = "calm" | "golden" | "ocean" | "forest" | "lavender" | "rose";

interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // CSS color for the swatch
  light: Record<string, string>;
  dark: Record<string, string>;
}

export const themePresets: ThemePreset[] = [
  {
    id: "calm",
    name: "Calm",
    description: "Neutral & minimal",
    preview: "hsl(266, 4%, 20.8%)",
    light: {
      "--primary": "266 4% 20.8%",
      "--primary-foreground": "248 0.3% 98.4%",
      "--accent": "248 0.7% 96.8%",
      "--accent-foreground": "266 4% 20.8%",
      "--ring": "257 4% 70.4%",
      "--sidebar-primary": "266 4% 20.8%",
      "--sidebar-primary-foreground": "248 0.3% 98.4%",
    },
    dark: {
      "--primary": "256 1.3% 92.9%",
      "--primary-foreground": "266 4% 20.8%",
      "--accent": "260 4.1% 27.9%",
      "--accent-foreground": "248 0.3% 98.4%",
      "--ring": "264 2.7% 55.1%",
      "--sidebar-primary": "264 24.3% 48.8%",
      "--sidebar-primary-foreground": "248 0.3% 98.4%",
    },
  },
  {
    id: "golden",
    name: "Golden Amber",
    description: "Warm & supportive",
    preview: "hsl(37, 95%, 56%)",
    light: {
      "--primary": "37 95% 56%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "40 60% 95%",
      "--accent-foreground": "30 50% 20%",
      "--ring": "37 70% 50%",
      "--sidebar-primary": "37 80% 50%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
    dark: {
      "--primary": "37 85% 55%",
      "--primary-foreground": "30 40% 10%",
      "--accent": "30 20% 25%",
      "--accent-foreground": "40 50% 90%",
      "--ring": "37 60% 45%",
      "--sidebar-primary": "37 70% 50%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool & serene",
    preview: "hsl(200, 70%, 50%)",
    light: {
      "--primary": "200 70% 50%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "200 40% 95%",
      "--accent-foreground": "200 50% 20%",
      "--ring": "200 50% 55%",
      "--sidebar-primary": "200 60% 45%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
    dark: {
      "--primary": "200 60% 55%",
      "--primary-foreground": "200 40% 10%",
      "--accent": "200 20% 25%",
      "--accent-foreground": "200 30% 90%",
      "--ring": "200 40% 45%",
      "--sidebar-primary": "200 50% 50%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Grounded & earthy",
    preview: "hsl(150, 40%, 40%)",
    light: {
      "--primary": "150 40% 40%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "150 30% 94%",
      "--accent-foreground": "150 30% 18%",
      "--ring": "150 30% 50%",
      "--sidebar-primary": "150 35% 38%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
    dark: {
      "--primary": "150 35% 50%",
      "--primary-foreground": "150 30% 8%",
      "--accent": "150 15% 22%",
      "--accent-foreground": "150 20% 88%",
      "--ring": "150 25% 40%",
      "--sidebar-primary": "150 30% 45%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft & dreamy",
    preview: "hsl(270, 50%, 60%)",
    light: {
      "--primary": "270 50% 60%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "270 40% 95%",
      "--accent-foreground": "270 30% 25%",
      "--ring": "270 35% 60%",
      "--sidebar-primary": "270 45% 55%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
    dark: {
      "--primary": "270 40% 60%",
      "--primary-foreground": "270 20% 10%",
      "--accent": "270 15% 25%",
      "--accent-foreground": "270 25% 88%",
      "--ring": "270 30% 50%",
      "--sidebar-primary": "270 35% 55%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Gentle & warm",
    preview: "hsl(350, 55%, 60%)",
    light: {
      "--primary": "350 55% 60%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "350 40% 95%",
      "--accent-foreground": "350 30% 22%",
      "--ring": "350 40% 58%",
      "--sidebar-primary": "350 50% 55%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
    dark: {
      "--primary": "350 45% 55%",
      "--primary-foreground": "350 20% 10%",
      "--accent": "350 15% 23%",
      "--accent-foreground": "350 25% 88%",
      "--ring": "350 30% 48%",
      "--sidebar-primary": "350 40% 52%",
      "--sidebar-primary-foreground": "0 0% 100%",
    },
  },
];

const THEME_KEY = "loop-color-theme";

function applyTheme(themeId: ThemeId) {
  const preset = themePresets.find((t) => t.id === themeId);
  if (!preset) return;

  const isDark = document.documentElement.classList.contains("dark");
  const vars = isDark ? preset.dark : preset.light;

  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function useColorTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeId) || "calm";
  });

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  // Re-apply when dark mode toggles
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(activeTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [activeTheme]);

  const selectTheme = (id: ThemeId) => {
    setActiveTheme(id);
    localStorage.setItem(THEME_KEY, id);
    applyTheme(id);
  };

  return { activeTheme, selectTheme, presets: themePresets };
}
