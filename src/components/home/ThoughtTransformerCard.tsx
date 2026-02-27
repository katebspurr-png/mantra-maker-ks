import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const ThoughtTransformerCard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-muted/60">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          Turn a limiting belief into a powerful mantra.
        </p>
        <Button 
          onClick={() => navigate("/thought-rewriter")}
          size="sm"
          variant="ghost"
          className="text-primary hover:text-primary/80 px-0"
        >
          Transform a Thought
        </Button>
      </div>
    </div>
  );
};
