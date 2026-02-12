import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  tabSwitch?: string; // switch to this demo tab before showing
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: "[data-tour='thought-transformer']",
    title: "Transform Your Thoughts",
    description:
      "Start here: Transform negative thoughts into positive affirmations. This helps you identify what you need to hear.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='record-button']",
    title: "Record in Your Voice",
    description:
      "Record affirmations in your own voice. Hearing yourself speak these truths helps them stick.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='sample-mantra']",
    title: "Listen & Loop",
    description:
      "Click to play a sample mantra and hear how looping works.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='playlists']",
    title: "Organize Your Practice",
    description:
      "Create playlists to organize mantras by theme, mood, or intention.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='try-today']",
    title: "Daily Inspiration",
    description:
      "Get daily affirmation suggestions. You can record these or use them as inspiration.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='feedback']",
    title: "We'd Love to Hear From You",
    description:
      "Share your thoughts anytime. Your feedback helps us improve.",
    position: "top",
    tabSwitch: "profile",
  },
];

interface DemoTourProps {
  active: boolean;
  onComplete: () => void;
  onTabSwitch?: (tab: string) => void;
}

export function DemoTour({ active, onComplete, onTabSwitch }: DemoTourProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalSteps = TOUR_STEPS.length;

  const updateSpotlight = useCallback(() => {
    if (!active || showFinal) {
      setSpotlightRect(null);
      return;
    }
    const currentStep = TOUR_STEPS[step];
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      setSpotlightRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [step, active, showFinal]);

  useEffect(() => {
    if (!active) return;
    // Switch tab if needed
    const currentStep = TOUR_STEPS[step];
    if (currentStep?.tabSwitch && onTabSwitch) {
      onTabSwitch(currentStep.tabSwitch);
      // Delay spotlight to let tab render
      const t = setTimeout(updateSpotlight, 300);
      return () => clearTimeout(t);
    } else if (step === 0 && onTabSwitch) {
      onTabSwitch("home");
      const t = setTimeout(updateSpotlight, 300);
      return () => clearTimeout(t);
    }
    updateSpotlight();
  }, [step, active, updateSpotlight, onTabSwitch]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [active, updateSpotlight]);

  // Reset when activated
  useEffect(() => {
    if (active) {
      setStep(0);
      setShowFinal(false);
    }
  }, [active]);

  if (!active) return null;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowFinal(true);
    }
  };

  const handleBack = () => {
    if (showFinal) {
      setShowFinal(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Final CTA modal
  if (showFinal) {
    return (
      <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in space-y-5">
            <div className="text-4xl">✨</div>
            <h2 className="text-xl font-semibold text-foreground">
              Ready to create your own mantras?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start building your personal affirmation practice today. Record, listen, and grow.
            </p>
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => {
                  onComplete();
                  navigate("/auth");
                }}
              >
                Sign Up to Get Started
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full text-sm"
                onClick={onComplete}
              >
                Explore Demo More
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = TOUR_STEPS[step];
  const padding = 8;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotlightRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const gap = 16;
    const style: React.CSSProperties = { maxWidth: "320px" };

    switch (currentStep.position) {
      case "bottom":
        style.top = spotlightRect.bottom + gap;
        style.left = spotlightRect.left + spotlightRect.width / 2;
        style.transform = "translateX(-50%)";
        break;
      case "top":
        style.bottom = window.innerHeight - spotlightRect.top + gap;
        style.left = spotlightRect.left + spotlightRect.width / 2;
        style.transform = "translateX(-50%)";
        break;
      case "left":
        style.top = spotlightRect.top + spotlightRect.height / 2;
        style.right = window.innerWidth - spotlightRect.left + gap;
        style.transform = "translateY(-50%)";
        break;
      case "right":
        style.top = spotlightRect.top + spotlightRect.height / 2;
        style.left = spotlightRect.right + gap;
        style.transform = "translateY(-50%)";
        break;
    }

    return style;
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay with spotlight cutout using SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={handleSkip}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - padding}
                y={spotlightRect.top - padding}
                width={spotlightRect.width + padding * 2}
                height={spotlightRect.height + padding * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Spotlight border ring */}
      {spotlightRect && (
        <div
          className="absolute rounded-xl border-2 border-primary/60 pointer-events-none transition-all duration-300"
          style={{
            top: spotlightRect.top - padding,
            left: spotlightRect.left - padding,
            width: spotlightRect.width + padding * 2,
            height: spotlightRect.height + padding * 2,
            boxShadow: "0 0 0 4px hsl(var(--primary) / 0.15)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-card rounded-xl border border-border shadow-2xl p-5 pointer-events-auto animate-fade-in"
        style={getTooltipStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </span>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <h3 className="font-semibold text-foreground mb-1.5">
          {currentStep.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Nav buttons */}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={handleSkip}
          >
            Skip Tour
          </Button>
          <Button size="sm" className="gap-1" onClick={handleNext}>
            {step === totalSteps - 1 ? "Finish" : "Next"}
            {step < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
