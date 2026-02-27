import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { themePresets, ThemeId } from "@/hooks/useColorTheme";

/* ─── Constants ─── */
const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

export const markOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
};

export const hasCompletedOnboarding = () => {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
};

const CALIBRATION_SCRIPT =
  "I am worthy of love, kindness, and respect. Every day I grow stronger and more confident in who I am. " +
  "I trust the journey of my life, even when the path is unclear. I release what no longer serves me and welcome " +
  "new possibilities with an open heart. My thoughts are powerful, and I choose to fill them with hope and gratitude. " +
  "I deserve peace, happiness, and success. I am enough exactly as I am right now.";
const SCRIPT_WORD_COUNT = CALIBRATION_SCRIPT.trim().split(/\s+/).length;
const MIN_DURATION = 10;

const TOTAL_STEPS = 5;

/* ─── Option data ─── */
const INTENTION_OPTIONS = [
  { value: "confidence", label: "Build Confidence", emoji: "🌱" },
  { value: "calm", label: "Find Calm", emoji: "🌊" },
  { value: "self-love", label: "Practice Self-Love", emoji: "💛" },
  { value: "focus", label: "Sharpen Focus", emoji: "🎯" },
  { value: "healing", label: "Support Healing", emoji: "🦋" },
  { value: "general", label: "Just Exploring", emoji: "✨" },
];

const EXPERIENCE_OPTIONS = [
  { value: "new", label: "I'm brand new to this", description: "We'll guide you gently" },
  { value: "some", label: "I've tried affirmations before", description: "Let's deepen your practice" },
  { value: "regular", label: "I practice regularly", description: "Welcome — let's personalize" },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Mornings", emoji: "🌅" },
  { value: "evening", label: "Evenings", emoji: "🌙" },
  { value: "anytime", label: "Anytime", emoji: "☁️" },
  { value: "commute", label: "On the Go", emoji: "🚶" },
];

/* ─── Animated step wrapper ─── */
function StepShell({ stepKey, children }: { stepKey: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      key={stepKey}
      className={cn(
        "flex-1 flex flex-col items-center justify-center px-8 text-center max-w-md mx-auto w-full",
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {children}
    </div>
  );
}

/* ─── Selectable pill ─── */
function OptionPill({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-5 transition-all duration-300",
        selected
          ? "bg-primary/8 shadow-[0_2px_12px_hsl(var(--primary)/0.12)]"
          : "bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  /* Answers */
  const [intention, setIntention] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [usageTime, setUsageTime] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("calm");

  /* Calibration */
  const [calPhase, setCalPhase] = useState<"idle" | "recording" | "done">("idle");
  const [calElapsed, setCalElapsed] = useState(0);
  const [calWpm, setCalWpm] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* ─── Theme application ─── */
  const applyTheme = (id: ThemeId) => {
    setSelectedTheme(id);
    const preset = themePresets.find(t => t.id === id);
    if (preset) {
      const isDark = document.documentElement.classList.contains("dark");
      const vars = isDark ? preset.dark : preset.light;
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  /* ─── Calibration ─── */
  const startCalibration = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.onstop = () => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const wpm = Math.round((SCRIPT_WORD_COUNT / duration) * 60);
        const clamped = Math.max(40, Math.min(300, wpm));
        setCalWpm(clamped);
        setCalPhase("done");

        localStorage.setItem("teleprompter_calibrated_wpm", String(clamped));
        localStorage.setItem("teleprompter_wpm", String(clamped));
        localStorage.setItem("teleprompter_calibrated_at", new Date().toISOString());
      };

      startTimeRef.current = Date.now();
      setCalElapsed(0);
      recorder.start();
      setCalPhase("recording");

      timerRef.current = setInterval(() => {
        setCalElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      // Mic denied — skip gracefully
    }
  }, []);

  const stopCalibration = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /* ─── Navigation ─── */
  const goNext = () => {
    // Save on step transitions
    if (step === 0 && intention) {
      localStorage.setItem("intention_focus", intention);
    }
    if (step === 1) {
      if (experience) localStorage.setItem("experience_level", experience);
      if (usageTime) localStorage.setItem("usage_time", usageTime);
    }
    if (step === 2) {
      localStorage.setItem("loop-color-theme", selectedTheme);
    }

    if (step === TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep(s => s + 1);
  };

  const finish = () => {
    markOnboardingComplete();
    navigate("/new-recording", { replace: true });
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  /* ─── Can proceed? ─── */
  const canProceed = (() => {
    if (step === 0) return !!intention;
    if (step === 1) return !!experience; // usage_time is optional
    return true;
  })();

  return (
    <div className="bg-background min-h-screen flex flex-col selection:bg-primary/20">
      {/* Progress dots — minimal */}
      <div className="flex justify-center gap-2.5 pt-10 pb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-500",
              i === step
                ? "w-6 h-1.5 bg-primary/70"
                : i < step
                  ? "w-1.5 h-1.5 bg-primary/30"
                  : "w-1.5 h-1.5 bg-muted-foreground/15"
            )}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          STEP 0 — Intention (What brings you here?)
          ═══════════════════════════════════════════ */}
      {step === 0 && (
        <StepShell stepKey="intention">
          <div className="w-full space-y-10">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                What brings you here?
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                There's no wrong answer. This helps us shape your experience.
              </p>
            </div>

            <div className="space-y-3">
              {INTENTION_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  selected={intention === opt.value}
                  onClick={() => setIntention(opt.value)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className={cn(
                      "text-[15px] transition-colors duration-300",
                      intention === opt.value ? "text-foreground font-medium" : "text-foreground/70"
                    )}>
                      {opt.label}
                    </span>
                    {intention === opt.value && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </div>
                </OptionPill>
              ))}
            </div>
          </div>
        </StepShell>
      )}

      {/* ═══════════════════════════════════════════
          STEP 1 — Experience + Timing
          ═══════════════════════════════════════════ */}
      {step === 1 && (
        <StepShell stepKey="experience">
          <div className="w-full space-y-10">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                How familiar are you with affirmations?
              </h1>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.value}
                  selected={experience === opt.value}
                  onClick={() => setExperience(opt.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={cn(
                        "text-[15px] transition-colors duration-300",
                        experience === opt.value ? "text-foreground font-medium" : "text-foreground/70"
                      )}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5">{opt.description}</p>
                    </div>
                    {experience === opt.value && (
                      <Check className="w-4 h-4 text-primary shrink-0 ml-3" />
                    )}
                  </div>
                </OptionPill>
              ))}
            </div>

            {/* Optional: When do you practice? */}
            {experience && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground/60">
                  When do you imagine practicing?
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setUsageTime(usageTime === opt.value ? null : opt.value)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-4 py-3.5 transition-all duration-300 text-left",
                        usageTime === opt.value
                          ? "bg-primary/8 shadow-[0_2px_12px_hsl(var(--primary)/0.1)]"
                          : "bg-card shadow-[var(--shadow-soft)]"
                      )}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className={cn(
                        "text-sm transition-colors",
                        usageTime === opt.value ? "text-foreground font-medium" : "text-foreground/60"
                      )}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StepShell>
      )}

      {/* ═══════════════════════════════════════════
          STEP 2 — Choose Your Atmosphere
          ═══════════════════════════════════════════ */}
      {step === 2 && (
        <StepShell stepKey="theme">
          <div className="w-full space-y-8">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                Choose the energy of your practice
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                Pick the tone that feels aligned with who you're becoming.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {themePresets.map((preset) => {
                const isActive = selectedTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyTheme(preset.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3.5 rounded-2xl p-5 transition-all duration-400",
                      isActive
                        ? "scale-[1.02] bg-card shadow-[0_4px_20px_hsl(var(--primary)/0.15)]"
                        : "bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full transition-all duration-400 flex items-center justify-center",
                        isActive && "shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                      )}
                      style={{ backgroundColor: preset.preview }}
                    >
                      {isActive && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <div
                      className="w-full h-7 rounded-lg transition-opacity duration-300"
                      style={{ backgroundColor: preset.preview, opacity: isActive ? 0.9 : 0.5 }}
                    />
                    <div>
                      <p className="text-sm font-medium">{preset.name}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">{preset.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </StepShell>
      )}

      {/* ═══════════════════════════════════════════
          STEP 3 — Calibration
          ═══════════════════════════════════════════ */}
      {step === 3 && (
        <StepShell stepKey="calibrate">
          <div className="w-full space-y-8">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                Let's match your natural rhythm
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                Read this short passage aloud so your teleprompter moves at your pace.
              </p>
            </div>

            {calPhase !== "done" && (
              <div className="bg-muted/20 rounded-2xl p-6 text-left text-[15px] leading-[1.85] text-foreground/75 max-h-[200px] overflow-y-auto">
                {CALIBRATION_SCRIPT}
              </div>
            )}

            {calPhase === "idle" && (
              <Button
                onClick={startCalibration}
                className="w-full h-14 text-base rounded-2xl shadow-[var(--shadow-medium)] gap-2.5"
                size="lg"
              >
                <Mic className="w-5 h-5" />
                Start Calibration
              </Button>
            )}

            {calPhase === "recording" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm text-muted-foreground/70">Listening…</span>
                  </div>
                  <span className="text-6xl font-extralight tabular-nums tracking-tight text-foreground">
                    {formatTimer(calElapsed)}
                  </span>
                  {calElapsed < MIN_DURATION && (
                    <p className="text-xs text-muted-foreground/40">
                      {MIN_DURATION - calElapsed}s more
                    </p>
                  )}
                </div>
                <Button
                  onClick={stopCalibration}
                  disabled={calElapsed < MIN_DURATION}
                  variant="outline"
                  className="w-full h-14 text-base rounded-2xl gap-2"
                  size="lg"
                >
                  <Square className="w-4 h-4" />
                  Done Reading
                </Button>
              </div>
            )}

            {calPhase === "done" && (
              <div className="space-y-8">
                <div className="rounded-2xl bg-primary/6 p-10 space-y-3">
                  <p className="text-6xl font-extralight text-primary tracking-tight">{calWpm}</p>
                  <p className="text-sm text-primary/60">words per minute</p>
                </div>
                <p className="text-base text-muted-foreground/70 leading-relaxed">
                  Your practice now moves at your speed.
                </p>
              </div>
            )}
          </div>
        </StepShell>
      )}

      {/* ═══════════════════════════════════════════
          STEP 4 — Activation
          ═══════════════════════════════════════════ */}
      {step === 4 && (
        <StepShell stepKey="activate">
          <div className="space-y-12">
            {/* Subtle radial glow */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-primary/8 animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute inset-3 rounded-full bg-primary/10 animate-[pulse_4s_ease-in-out_infinite_1s]" />
              <div className="relative w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-primary/80" />
              </div>
            </div>

            <div>
              <h1 className="text-[32px] font-semibold text-foreground leading-[1.2] mb-5 font-serif">
                You're ready.
              </h1>
              <p className="text-lg text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                Press record and speak your first affirmation into being.
              </p>
            </div>
          </div>
        </StepShell>
      )}

      {/* ─── Bottom CTA ─── */}
      <div className="w-full max-w-md mx-auto px-8 pb-16 space-y-3 shrink-0">
        {/* Primary CTA per step */}
        {step === 0 && (
          <Button
            onClick={goNext}
            disabled={!canProceed}
            size="lg"
            className={cn(
              "w-full h-14 text-base font-medium rounded-2xl transition-all duration-500",
              canProceed ? "shadow-[var(--shadow-medium)] opacity-100" : "opacity-40"
            )}
          >
            Continue
          </Button>
        )}

        {step === 1 && (
          <Button
            onClick={goNext}
            disabled={!canProceed}
            size="lg"
            className={cn(
              "w-full h-14 text-base font-medium rounded-2xl transition-all duration-500",
              canProceed ? "shadow-[var(--shadow-medium)] opacity-100" : "opacity-40"
            )}
          >
            Continue
          </Button>
        )}

        {step === 2 && (
          <Button
            onClick={goNext}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            This Feels Right
          </Button>
        )}

        {step === 3 && (
          <>
            {calPhase === "done" && (
              <Button
                onClick={goNext}
                size="lg"
                className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
              >
                Perfect
              </Button>
            )}
            {calPhase === "idle" && (
              <button
                onClick={goNext}
                className="w-full text-sm text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300 py-3"
              >
                Skip for now
              </button>
            )}
          </>
        )}

        {step === 4 && (
          <Button
            onClick={finish}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            Record My First Affirmation
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
