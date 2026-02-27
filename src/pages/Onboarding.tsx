import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Mic, Square, Focus, Leaf, Zap } from "lucide-react";
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
const TOTAL_STEPS = 6;

/* ═══════════════════════════════════════════
   Vibe system — subtle tone adaptations
   ═══════════════════════════════════════════ */
type Vibe = "focused" | "grounded" | "energized";

const VIBE_OPTIONS: { value: Vibe; label: string; tagline: string; icon: React.ReactNode }[] = [
  { value: "focused", label: "Focused", tagline: "Clean, disciplined, minimal.", icon: <Focus className="w-6 h-6" /> },
  { value: "grounded", label: "Grounded", tagline: "Calm, steady, spacious.", icon: <Leaf className="w-6 h-6" /> },
  { value: "energized", label: "Energized", tagline: "Forward-moving, confident, sharp.", icon: <Zap className="w-6 h-6" /> },
];

/** Returns vibe-adapted copy. Differences are subtle — language density and pacing only. */
function vibeCopy(vibe: Vibe | null) {
  const v = vibe ?? "grounded";
  return {
    // Transition speed
    transitionMs: v === "focused" ? 500 : v === "energized" ? 550 : 700,
    // Step 1 — Intention
    intentionHeadline: v === "focused" ? "What's your focus?" : v === "energized" ? "What are you building toward?" : "What brings you here?",
    intentionSubtext: v === "focused" ? "Select one." : v === "energized" ? "Pick the direction that pulls you forward." : "There's no wrong answer. This helps us shape your experience.",
    // Step 2 — Experience
    experienceHeadline: v === "focused" ? "Your experience level" : v === "energized" ? "Where are you in your practice?" : "How familiar are you with affirmations?",
    timingQuestion: v === "focused" ? "Preferred time?" : v === "energized" ? "When do you show up?" : "When do you imagine practicing?",
    // Step 3 — Theme
    themeHeadline: v === "focused" ? "Set your visual tone" : v === "energized" ? "Choose your energy" : "Choose the energy of your practice",
    themeSubtext: v === "focused" ? "This applies across the app." : v === "energized" ? "Pick what matches the version of you that's emerging." : "Pick the tone that feels aligned with who you're becoming.",
    themeCta: v === "focused" ? "Apply" : v === "energized" ? "Lock It In" : "This Feels Right",
    // Step 4 — Calibration
    calibrationHeadline: v === "focused" ? "Calibrate your pace" : v === "energized" ? "Set your speed" : "Let's match your natural rhythm",
    calibrationSubtext: v === "focused" ? "Read aloud. We'll set your teleprompter speed." : v === "energized" ? "Read this passage — we'll sync to your tempo." : "Read this short passage aloud so your teleprompter moves at your pace.",
    calibrationStartCta: v === "focused" ? "Begin" : v === "energized" ? "Start" : "Start Calibration",
    calibrationDoneLine: v === "focused" ? "Pace locked." : v === "energized" ? "Speed captured." : "Your practice now moves at your speed.",
    calibrationDoneCta: v === "focused" ? "Done" : v === "energized" ? "Let's Go" : "Perfect",
    // Step 5 — Activation
    activationHeadline: v === "focused" ? "Ready." : v === "energized" ? "Time to begin." : "You're ready.",
    activationSubtext: v === "focused" ? "Record your first affirmation." : v === "energized" ? "Hit record. Speak your first affirmation into existence." : "Press record and speak your first affirmation into being.",
    activationCta: v === "focused" ? "Record Now" : v === "energized" ? "Let's Record" : "Record My First Affirmation",
    // Section spacing
    sectionGap: v === "focused" ? "space-y-8" : v === "grounded" ? "space-y-10" : "space-y-9",
    pillPadding: v === "focused" ? "p-4" : v === "grounded" ? "p-5" : "p-4",
  };
}

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
function StepShell({ stepKey, transitionMs, children }: { stepKey: string; transitionMs: number; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      key={stepKey}
      className={cn(
        "flex-1 flex flex-col items-center justify-center px-8 text-center max-w-md mx-auto w-full ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transition: `all ${transitionMs}ms ease-out` }}
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
        "w-full text-left rounded-2xl transition-all duration-300",
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

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  /* Answers */
  const [vibe, setVibe] = useState<Vibe | null>(null);
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

  const copy = vibeCopy(vibe);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* ─── Theme ─── */
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
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
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
    } catch { /* mic denied — skip */ }
  }, []);

  const stopCalibration = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /* ─── Navigation ─── */
  const goNext = () => {
    if (step === 0 && vibe) localStorage.setItem("selected_vibe", vibe);
    if (step === 1 && intention) localStorage.setItem("intention_focus", intention);
    if (step === 2) {
      if (experience) localStorage.setItem("experience_level", experience);
      if (usageTime) localStorage.setItem("usage_time", usageTime);
    }
    if (step === 3) localStorage.setItem("loop-color-theme", selectedTheme);

    if (step === TOTAL_STEPS - 1) { finish(); return; }
    setStep(s => s + 1);
  };

  const finish = () => {
    markOnboardingComplete();
    navigate("/new-recording", { replace: true });
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const canProceed = (() => {
    if (step === 0) return !!vibe;
    if (step === 1) return !!intention;
    if (step === 2) return !!experience;
    return true;
  })();

  return (
    <div className="bg-background min-h-screen flex flex-col selection:bg-primary/20">
      {/* Progress dots */}
      <div className="flex justify-center gap-2.5 pt-10 pb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-500",
              i === step ? "w-6 h-1.5 bg-primary/70"
                : i < step ? "w-1.5 h-1.5 bg-primary/30"
                  : "w-1.5 h-1.5 bg-muted-foreground/15"
            )}
          />
        ))}
      </div>

      {/* ═══ STEP 0 — Vibe Selection ═══ */}
      {step === 0 && (
        <StepShell stepKey="vibe" transitionMs={700}>
          <div className="w-full space-y-10">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                How should this space feel?
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                Choose the tone that supports how you work.
              </p>
            </div>

            <div className="space-y-3">
              {VIBE_OPTIONS.map((opt) => {
                const isActive = vibe === opt.value;
                return (
                  <OptionPill key={opt.value} selected={isActive} onClick={() => setVibe(opt.value)} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300",
                        isActive ? "bg-primary/12 text-primary" : "bg-muted/50 text-muted-foreground/50"
                      )}>
                        {opt.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-[16px] transition-colors duration-300",
                            isActive ? "text-foreground font-medium" : "text-foreground/70"
                          )}>
                            {opt.label}
                          </p>
                          {isActive && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-[13px] text-muted-foreground/50 mt-0.5">{opt.tagline}</p>
                      </div>
                    </div>
                  </OptionPill>
                );
              })}
            </div>
          </div>
        </StepShell>
      )}

      {/* ═══ STEP 1 — Intention ═══ */}
      {step === 1 && (
        <StepShell stepKey="intention" transitionMs={copy.transitionMs}>
          <div className={cn("w-full", copy.sectionGap)}>
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                {copy.intentionHeadline}
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                {copy.intentionSubtext}
              </p>
            </div>

            <div className="space-y-3">
              {INTENTION_OPTIONS.map((opt) => (
                <OptionPill key={opt.value} selected={intention === opt.value} onClick={() => setIntention(opt.value)} className={copy.pillPadding}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className={cn(
                      "text-[15px] transition-colors duration-300",
                      intention === opt.value ? "text-foreground font-medium" : "text-foreground/70"
                    )}>
                      {opt.label}
                    </span>
                    {intention === opt.value && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                </OptionPill>
              ))}
            </div>
          </div>
        </StepShell>
      )}

      {/* ═══ STEP 2 — Experience + Timing ═══ */}
      {step === 2 && (
        <StepShell stepKey="experience" transitionMs={copy.transitionMs}>
          <div className={cn("w-full", copy.sectionGap)}>
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                {copy.experienceHeadline}
              </h1>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <OptionPill key={opt.value} selected={experience === opt.value} onClick={() => setExperience(opt.value)} className={copy.pillPadding}>
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
                    {experience === opt.value && <Check className="w-4 h-4 text-primary shrink-0 ml-3" />}
                  </div>
                </OptionPill>
              ))}
            </div>

            {experience && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground/60">{copy.timingQuestion}</p>
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

      {/* ═══ STEP 3 — Theme ═══ */}
      {step === 3 && (
        <StepShell stepKey="theme" transitionMs={copy.transitionMs}>
          <div className="w-full space-y-8">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                {copy.themeHeadline}
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                {copy.themeSubtext}
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
                      "relative flex flex-col items-center gap-3.5 rounded-2xl p-5 transition-all",
                      isActive
                        ? "scale-[1.02] bg-card shadow-[0_4px_20px_hsl(var(--primary)/0.15)]"
                        : "bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)]"
                    )}
                    style={{ transitionDuration: `${copy.transitionMs}ms` }}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isActive && "shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                      )}
                      style={{ backgroundColor: preset.preview, transitionDuration: `${copy.transitionMs}ms` }}
                    >
                      {isActive && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <div
                      className="w-full h-7 rounded-lg transition-opacity"
                      style={{ backgroundColor: preset.preview, opacity: isActive ? 0.9 : 0.5, transitionDuration: `${copy.transitionMs}ms` }}
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

      {/* ═══ STEP 4 — Calibration ═══ */}
      {step === 4 && (
        <StepShell stepKey="calibrate" transitionMs={copy.transitionMs}>
          <div className="w-full space-y-8">
            <div>
              <h1 className="text-[28px] font-semibold text-foreground leading-[1.25] mb-4 font-serif">
                {copy.calibrationHeadline}
              </h1>
              <p className="text-base text-muted-foreground/70 leading-relaxed">
                {copy.calibrationSubtext}
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
                {copy.calibrationStartCta}
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
                    <p className="text-xs text-muted-foreground/40">{MIN_DURATION - calElapsed}s more</p>
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
                  {copy.calibrationDoneLine}
                </p>
              </div>
            )}
          </div>
        </StepShell>
      )}

      {/* ═══ STEP 5 — Activation ═══ */}
      {step === 5 && (
        <StepShell stepKey="activate" transitionMs={copy.transitionMs}>
          <div className="space-y-12">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-primary/8 animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute inset-3 rounded-full bg-primary/10 animate-[pulse_4s_ease-in-out_infinite_1s]" />
              <div className="relative w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-primary/80" />
              </div>
            </div>

            <div>
              <h1 className="text-[32px] font-semibold text-foreground leading-[1.2] mb-5 font-serif">
                {copy.activationHeadline}
              </h1>
              <p className="text-lg text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                {copy.activationSubtext}
              </p>
            </div>
          </div>
        </StepShell>
      )}

      {/* ─── Bottom CTA ─── */}
      <div className="w-full max-w-md mx-auto px-8 pb-16 space-y-3 shrink-0">
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

        {step === 3 && (
          <Button
            onClick={goNext}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            {copy.themeCta}
          </Button>
        )}

        {step === 4 && (
          <>
            {calPhase === "done" && (
              <Button
                onClick={goNext}
                size="lg"
                className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
              >
                {copy.calibrationDoneCta}
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

        {step === 5 && (
          <Button
            onClick={finish}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            {copy.activationCta}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
