import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ToneAnalysisSnapshot } from "@/types";

interface ToneAnalysisProps {
  recordingId: string;
  audioUrl: string;
  affirmationText?: string;
}

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 71) return "bg-green-500";
    if (score >= 41) return "bg-amber-500";
    return "bg-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return "High";
    if (score >= 41) return "Moderate";
    return "Building";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {score}/100 · {getScoreLabel(score)}
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export const ToneAnalysis = ({ recordingId, audioUrl, affirmationText }: ToneAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<ToneAnalysisSnapshot | null>(null);

  // Load existing snapshot on mount
  useEffect(() => {
    loadSnapshot();
  }, [recordingId]);

  const loadSnapshot = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tone_analysis_snapshots")
        .select("*")
        .eq("recording_id", recordingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSnapshot({
          ...data,
          strengths: data.strengths || null,
          improvements: data.improvements || null,
        } as ToneAnalysisSnapshot);
      }
    } catch (error: any) {
      console.error("Failed to load tone analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("analyze-tone", {
        body: {
          audioUrl,
          affirmationText,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Save snapshot to database
      const { data: savedSnapshot, error: saveError } = await supabase
        .from("tone_analysis_snapshots")
        .insert({
          user_id: user.id,
          recording_id: recordingId,
          sincerity_score: data.sincerity_score,
          conviction_score: data.conviction_score,
          summary: data.analysis_summary,
          strengths: data.strengths || [],
          improvements: data.suggested_improvements || [],
          practice_exercise: data.practice_exercise || null,
          model_version: "v1",
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setSnapshot({
        ...savedSnapshot,
        strengths: savedSnapshot.strengths || null,
        improvements: savedSnapshot.improvements || null,
      } as ToneAnalysisSnapshot);
      
      toast.success("Tone analysis complete");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze tone");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Tone Analysis
        </h3>
        <div className="bg-secondary/50 rounded-xl p-6 text-center">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Tone Analysis
        </h3>
        {!snapshot && !isAnalyzing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        )}
      </div>

      {!snapshot && !isAnalyzing && (
        <p className="text-sm text-muted-foreground">
          Get AI feedback on your conviction and sincerity when speaking this affirmation.
        </p>
      )}

      {isAnalyzing && (
        <div className="bg-secondary/50 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Analyzing your tone and delivery...
          </p>
        </div>
      )}

      {snapshot && !isAnalyzing && (
        <div className="space-y-5">
          {/* Scores */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
            <ScoreBar label="Conviction" score={snapshot.conviction_score} />
            <ScoreBar label="Sincerity" score={snapshot.sincerity_score} />
          </div>

          {/* Summary */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm leading-relaxed">{snapshot.summary}</p>
          </div>

          {/* Strengths */}
          {snapshot.strengths && snapshot.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {snapshot.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {snapshot.improvements && snapshot.improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600">
                <TrendingUp className="w-4 h-4" />
                Areas to Grow
              </h4>
              <ul className="space-y-1.5">
                {snapshot.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Exercise */}
          {snapshot.practice_exercise && (
            <div className="bg-primary/10 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
                <Lightbulb className="w-4 h-4" />
                Practice Exercise
              </h4>
              <p className="text-sm">{snapshot.practice_exercise}</p>
            </div>
          )}

          {/* Re-analyze button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-run Analysis
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Analyzed on {new Date(snapshot.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
