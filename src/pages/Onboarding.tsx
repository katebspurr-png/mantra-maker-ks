import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Play, ListMusic, MessageSquareHeart, ChevronLeft } from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

export const markOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
};

export const hasCompletedOnboarding = () => {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
};

interface Step {
  key: string;
  icon: React.ReactNode;
  heading: string;
  body: string;
}

const steps: Step[] = [
  {
    key: "welcome",
    icon: <div className="w-10 h-10 rounded-full bg-primary/20" />,
    heading: "Welcome to Mantra Maker",
    body: "A calm space to record affirmations in your own voice and listen on loop. No pressure, no streaks, no guilt — just gentle support for building positive beliefs.",
  },
  {
    key: "record",
    icon: <Mic className="w-8 h-8 text-primary" />,
    heading: "Your voice, your words",
    body: "Record affirmations in your own voice, or choose from our library of suggestions. Hearing yourself speak positive truths helps them stick.",
  },
  {
    key: "listen",
    icon: <Play className="w-8 h-8 text-primary" />,
    heading: "Play on loop",
    body: "Listen to your mantras on repeat while you work, rest, or move through your day. Repetition helps affirmations become internalized beliefs.",
  },
  {
    key: "playlists",
    icon: <ListMusic className="w-8 h-8 text-primary" />,
    heading: "Create playlists",
    body: "Group mantras by theme, mood, or intention. Build collections that support you in different moments.",
  },
  {
    key: "feedback",
    icon: <MessageSquareHeart className="w-8 h-8 text-primary" />,
    heading: "We'd love your thoughts",
    body: "You can share feedback anytime from Settings. Your input helps us make Mantra Maker better for everyone.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const isLast = current === steps.length - 1;

  const handleSkip = () => {
    markOnboardingComplete();
    navigate("/home", { replace: true });
  };

  const handleNext = () => {
    if (isLast) {
      markOnboardingComplete();
      navigate("/home", { replace: true });
    } else {
      setCurrent(current + 1);
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const step = steps[current];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Back button */}
      <div className="p-4">
        {current > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div className="h-8" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          {step.icon}
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          {step.heading}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {step.body}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="w-full max-w-sm mx-auto px-8 pb-16 space-y-3">
        <Button onClick={handleNext} size="lg" className="w-full">
          {isLast ? "Get Started" : "Next"}
        </Button>
        {!isLast && (
          <Button onClick={handleSkip} variant="ghost" size="sm" className="w-full text-muted-foreground">
            Skip for now
          </Button>
        )}
      </div>

      {/* Progress dots */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
