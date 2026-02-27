import { Home, BookOpen, Mic, ListMusic, User, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Sparkles, label: "Transform", path: "/thought-rewriter", isAccent: true },
  { icon: Mic, label: "Record", path: "/new-recording", isCenter: true },
  { icon: ListMusic, label: "Playlists", path: "/playlists" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/40 safe-area-pb">
      <div className="flex items-center justify-around h-[68px] max-w-lg mx-auto px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[var(--shadow-float)]">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1.5 text-muted-foreground font-medium">{item.label}</span>
              </button>
            );
          }

          if (item.isAccent) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/80 flex items-center justify-center shadow-[var(--shadow-soft)]">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1.5 text-muted-foreground font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center py-2 px-2 min-w-[52px]"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span
                className={cn(
                  "text-[9px] mt-1 transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground/70"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
