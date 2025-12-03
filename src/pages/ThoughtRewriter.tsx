import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Affirmations {
  soft: string;
  balanced: string;
  powerful: string;
}

export default function ThoughtRewriter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thought, setThought] = useState("");
  const [affirmations, setAffirmations] = useState<Affirmations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRewrite = async () => {
    if (!thought.trim()) {
      toast({
        title: "Enter a thought",
        description: "Please type a limiting belief to transform.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAffirmations(null);

    try {
      const { data, error } = await supabase.functions.invoke("rewrite-thought", {
        body: { negativeThought: thought },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAffirmations(data.affirmations);
    } catch (error) {
      console.error("Error rewriting thought:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecord = (text: string) => {
    navigate("/new-recording", { state: { prefilledText: text } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Thought Rewriter</h1>
            <p className="text-sm text-muted-foreground">
              Transform negative thoughts into affirmations
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm mb-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Your limiting belief
          </label>
          <Textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="I'm not good enough to..."
            className="min-h-[100px] text-base resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleRewrite}
          disabled={isLoading || !thought.trim()}
          className="w-full gap-2 mb-6"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transforming...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Transform Thought
            </>
          )}
        </Button>

        {/* Results */}
        {affirmations && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Your New Affirmations
            </h2>

            {/* Soft */}
            <div className="bg-card rounded-xl border border-border p-4">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                Soft
              </span>
              <p className="text-base mb-3">{affirmations.soft}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRecord(affirmations.soft)}
                className="gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                Record This
              </Button>
            </div>

            {/* Balanced */}
            <div className="bg-card rounded-xl border border-border p-4">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                Balanced
              </span>
              <p className="text-base mb-3">{affirmations.balanced}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRecord(affirmations.balanced)}
                className="gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                Record This
              </Button>
            </div>

            {/* Powerful */}
            <div className="bg-card rounded-xl border border-border p-4">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                Powerful
              </span>
              <p className="text-base mb-3">{affirmations.powerful}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRecord(affirmations.powerful)}
                className="gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                Record This
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
