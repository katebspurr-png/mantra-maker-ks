import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const ThoughtTransformerCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">Thought Transformer</h3>
            <p className="text-sm text-muted-foreground">
              Turn a limiting belief into a powerful mantra.
            </p>
            <Button 
              onClick={() => navigate("/thought-rewriter")}
              className="mt-2"
              size="sm"
            >
              Transform a Thought
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
