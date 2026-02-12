import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoContext";

export function DemoBanner() {
  const { isDemoMode, exitDemo } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            Demo Mode
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Exploring Mantra Maker
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs"
            onClick={() => {
              exitDemo();
              navigate("/auth");
            }}
          >
            Sign Up
          </Button>
          <button
            onClick={() => {
              exitDemo();
              navigate("/");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
