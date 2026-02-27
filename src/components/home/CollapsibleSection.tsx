import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  id,
  title,
  collapsed,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) {
  // Sections that get a soft surface treatment
  const surfaceSections = new Set(["try-today", "recent-recordings", "favorites", "playlists", "your-rhythm"]);
  const hasSurface = surfaceSections.has(id);

  return (
    <div className={className}>
      <button
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={`section-${id}`}
        aria-label={`${collapsed ? "Expand" : "Collapse"} ${title} section`}
        className="w-full flex items-center justify-between py-2 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      >
        <h2 className="font-medium text-[20px] text-foreground tracking-tight">
          {title}
        </h2>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            collapsed && "-rotate-90"
          )}
        />
      </button>
      <div
        id={`section-${id}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          collapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        )}
      >
        <div className={cn(
          "overflow-hidden",
          hasSurface && !collapsed && "bg-surface rounded-2xl p-5 shadow-soft"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}
