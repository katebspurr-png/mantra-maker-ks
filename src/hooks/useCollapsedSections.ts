import { useState, useCallback } from "react";

const STORAGE_KEY = "home_collapsed_sections";

export function useCollapsedSections() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggle = useCallback((sectionId: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isCollapsed = useCallback(
    (sectionId: string) => !!collapsed[sectionId],
    [collapsed]
  );

  return { isCollapsed, toggle };
}
