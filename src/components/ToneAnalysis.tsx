import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToneAnalysisResult {
  conviction_score: number;
  sincerity_score: number;
  analysis_summary: string;
  strengths: string[];
  suggested_improvements: string[];
  practice_exercise: string;
}

interface ToneAnalysisProps {
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

export const ToneAnalysis = ({ audioUrl, affirmationText }: ToneAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ToneAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-tone", {
        body: {
          audioUrl,
          affirmationText,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast.success("Tone analysis complete");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze tone");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Tone Analysis
        </h3>
        {!analysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        )}
      </div>

      {!analysis && !isAnalyzing && (
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

      {analysis && (
        <div className="space-y-5">
          {/* Scores */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
            <ScoreBar label="Conviction" score={analysis.conviction_score} />
            <ScoreBar label="Sincerity" score={analysis.sincerity_score} />
          </div>

          {/* Summary */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm leading-relaxed">{analysis.analysis_summary}</p>
          </div>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {analysis.suggested_improvements && analysis.suggested_improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600">
                <TrendingUp className="w-4 h-4" />
                Areas to Grow
              </h4>
              <ul className="space-y-1.5">
                {analysis.suggested_improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Exercise */}
          {analysis.practice_exercise && (
            <div className="bg-primary/10 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
                <Lightbulb className="w-4 h-4" />
                Practice Exercise
              </h4>
              <p className="text-sm">{analysis.practice_exercise}</p>
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
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Again
          </Button>
        </div>
      )}
    </div>
  );
};
