import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Library, Home, MessageSquareHeart } from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

export const markOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
};

export const hasCompletedOnboarding = () => {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleSkip = () => {
    markOnboardingComplete();
    navigate("/home", { replace: true });
  };

  const handleNext = () => {
    if (currentScreen < 4) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleAction = (path: string) => {
    markOnboardingComplete();
    navigate(path, { replace: true });
  };

  const screens = [
    // Screen 1: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/20" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          Welcome to Loop
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A quiet space to practice hearing your own voice — again and again — until it feels true.
        </p>
      </div>
      <div className="w-full max-w-sm pb-12 space-y-3">
        <Button onClick={handleNext} size="lg" className="w-full">
          Get started
        </Button>
        <Button onClick={handleSkip} variant="ghost" size="sm" className="w-full text-muted-foreground">
          Skip for now
        </Button>
      </div>
    </div>,

    // Screen 2: How it works
    <div key="how-it-works" className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <h1 className="text-3xl font-semibold text-foreground mb-10">
          How it works
        </h1>
        <div className="space-y-6 text-left w-full">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
              1
            </div>
            <p className="text-lg text-foreground pt-1">
              Choose or write an affirmation
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
              2
            </div>
            <p className="text-lg text-foreground pt-1">
              Record your voice (as many takes as you like)
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
              3
            </div>
            <p className="text-lg text-foreground pt-1">
              Listen on a loop — daily or anytime
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-10 italic">
          There's no right way to sound. Just show up.
        </p>
      </div>
      <div className="w-full max-w-sm pb-12">
        <Button onClick={handleNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </div>,

    // Screen 3: Voice & privacy
    <div key="privacy" className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <Mic className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          Your voice, your pace
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Loop uses your microphone so you can record affirmations in your own voice. You're always in control — nothing is shared.
        </p>
      </div>
      <div className="w-full max-w-sm pb-12">
        <Button onClick={handleNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </div>,

    // Screen 4: Feedback invitation
    <div key="feedback" className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <MessageSquareHeart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          We'd love your thoughts
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          You can share feedback anytime from Settings. Your input helps us make Mantra Maker better for everyone.
        </p>
      </div>
      <div className="w-full max-w-sm pb-12">
        <Button onClick={handleNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </div>,

    // Screen 4: First action
    <div key="first-action" className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          Let's try one together
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Choose how you'd like to begin.
        </p>
      </div>
      <div className="w-full max-w-sm pb-12 space-y-3">
        <Button 
          onClick={() => handleAction("/new-recording")} 
          size="lg" 
          className="w-full gap-2"
        >
          <Mic className="w-4 h-4" />
          Record your first affirmation
        </Button>
        <Button 
          onClick={() => handleAction("/library")} 
          variant="outline" 
          size="lg" 
          className="w-full gap-2"
        >
          <Library className="w-4 h-4" />
          Browse example affirmations
        </Button>
        <Button 
          onClick={() => handleAction("/home")} 
          variant="ghost" 
          size="lg" 
          className="w-full gap-2 text-muted-foreground"
        >
          <Home className="w-4 h-4" />
          Skip — explore on my own
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="bg-background">
      {screens[currentScreen]}
      
      {/* Progress dots */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentScreen ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
