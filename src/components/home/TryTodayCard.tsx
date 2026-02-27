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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span className="font-semibold text-[17px]">Try This Today</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={pickRandomAffirmation}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-[17px] italic mb-4 leading-[1.6]">
          "{affirmation.text}"
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-[13px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {categoryLabels[affirmation.category] || affirmation.category}
          </span>
          <Button 
            size="sm"
            onClick={handleRecordThis}
          >
            <Mic className="w-4 h-4 mr-2" />
            Record This
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
