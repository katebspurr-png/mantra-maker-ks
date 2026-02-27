import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Mic, RefreshCw } from "lucide-react";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";

export const TryTodayCard = () => {
  const navigate = useNavigate();
  const [affirmation, setAffirmation] = useState<typeof AFFIRMATIONS_LIBRARY[0] | null>(null);

  useEffect(() => {
    pickRandomAffirmation();
  }, []);

  const pickRandomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS_LIBRARY.length);
    setAffirmation(AFFIRMATIONS_LIBRARY[randomIndex]);
  };

  const handleRecordThis = () => {
    if (affirmation) {
      navigate("/new-recording", { state: { text: affirmation.text } });
    }
  };

  const categoryLabels: Record<string, string> = {
    confidence: "Confidence",
    "self-love": "Self-Love",
    abundance: "Abundance",
    calm: "Calm",
    identity: "Identity",
    healing: "Healing",
    relationships: "Relationships",
  };

  if (!affirmation) return null;

  return (
    <div className="space-y-5">
      <p className="text-[22px] leading-[1.8] text-foreground/90 font-serif">
        "{affirmation.text}"
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">
            {categoryLabels[affirmation.category] || affirmation.category}
          </span>
          <button
            onClick={pickRandomAffirmation}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <Button 
          size="sm"
          onClick={handleRecordThis}
        >
          <Mic className="w-3.5 h-3.5 mr-1.5" />
          Record
        </Button>
      </div>
    </div>
  );
};
