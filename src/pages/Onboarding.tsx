import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { themePresets, ThemeId } from "@/hooks/useColorTheme";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

export const markOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
};

export const hasCompletedOnboarding = () => {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
};

/* ─── Calibration constants ─── */
const CALIBRATION_SCRIPT =
  "I am worthy of love, kindness, and respect. Every day I grow stronger and more confident in who I am. " +
  "I trust the journey of my life, even when the path is unclear. I release what no longer serves me and welcome " +
  "new possibilities with an open heart. My thoughts are powerful, and I choose to fill them with hope and gratitude. " +
  "I deserve peace, happiness, and success. I am enough exactly as I am right now.";
const SCRIPT_WORD_COUNT = CALIBRATION_SCRIPT.trim().split(/\s+/).length;
const MIN_DURATION = 10;

/* ─── Step wrapper with fade/slide animation ─── */
function StepContainer({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <div
      key={stepKey}
      className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-md mx-auto w-full animate-fade-in"
    >
      {children}
    </div>
  );
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  /* ─── Theme state ─── */
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("calm");

  /* ─── Calibration state ─── */
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

  /* ─── Theme selection ─── */
  const handleSelectTheme = (id: ThemeId) => {
    setSelectedTheme(id);
    // Apply immediately
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

        // Save
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
      // Mic denied — allow skip
    }
  }, []);

  const stopCalibration = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /* ─── Navigation ─── */
  const next = () => {
    if (step === 1) {
      // Save theme
      localStorage.setItem("loop-color-theme", selectedTheme);
    }
    if (step === 3) {
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

  const totalSteps = 4;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Progress bar — thin, subtle */}
      <div className="px-8 pt-6">
        <div className="h-0.5 bg-muted/40 rounded-full overflow-hidden max-w-md mx-auto">
          <div
            className="h-full bg-primary/60 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ─── STEP 0: Identity Framing ─── */}
      {step === 0 && (
        <StepContainer stepKey="identity">
          <div className="mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground leading-tight mb-5">
              This Is Where Your<br />New Story Begins.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The words you repeat shape the life you live. Let's set up your space.
            </p>
          </div>
        </StepContainer>
      )}

      {/* ─── STEP 1: Choose Your Atmosphere ─── */}
      {step === 1 && (
        <StepContainer stepKey="theme">
          <div className="w-full mb-8">
            <h1 className="text-2xl font-semibold text-foreground leading-tight mb-3">
              Choose the Energy of<br />Your Practice
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Pick the tone that feels aligned with who you're becoming.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              {themePresets.map((preset) => {
                const isActive = selectedTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectTheme(preset.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-300",
                      "shadow-[var(--shadow-soft)]",
                      isActive
                        ? "scale-[1.02] ring-2 ring-primary/40 bg-card"
                        : "bg-card hover:bg-card/80"
                    )}
                  >
                    {/* Color swatch */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center",
                        isActive && "shadow-[0_0_16px_var(--shadow-glow,rgba(0,0,0,0.1))]"
                      )}
                      style={{ backgroundColor: preset.preview }}
                    >
                      {isActive && <Check className="w-5 h-5 text-white" />}
                    </div>
                    {/* Sample button preview */}
                    <div
                      className="w-full h-8 rounded-lg opacity-80"
                      style={{ backgroundColor: preset.preview }}
                    />
                    <span className="text-sm font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground/60">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </StepContainer>
      )}

      {/* ─── STEP 2: Calibration ─── */}
      {step === 2 && (
        <StepContainer stepKey="calibrate">
          <div className="w-full mb-6">
            <h1 className="text-2xl font-semibold text-foreground leading-tight mb-3">
              Let's Match Your<br />Natural Rhythm
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Read this short passage so your teleprompter moves at your pace.
            </p>

            {calPhase !== "done" && (
              <div className="bg-muted/30 rounded-2xl p-6 text-left text-[15px] leading-[1.8] text-foreground/80 mb-6 max-h-[200px] overflow-y-auto">
                {CALIBRATION_SCRIPT}
              </div>
            )}

            {calPhase === "idle" && (
              <Button onClick={startCalibration} className="w-full h-13 text-base rounded-2xl shadow-[var(--shadow-medium)]" size="lg">
                Start Calibration
              </Button>
            )}

            {calPhase === "recording" && (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm text-muted-foreground">Recording</span>
                  </div>
                  <span className="text-5xl font-light tabular-nums tracking-tight text-foreground">
                    {formatTimer(calElapsed)}
                  </span>
                  {calElapsed < MIN_DURATION && (
                    <p className="text-xs text-muted-foreground/60">
                      {MIN_DURATION - calElapsed}s minimum remaining
                    </p>
                  )}
                </div>
                <Button
                  onClick={stopCalibration}
                  disabled={calElapsed < MIN_DURATION}
                  className="w-full h-13 text-base rounded-2xl"
                  size="lg"
                >
                  Stop Recording
                </Button>
              </div>
            )}

            {calPhase === "done" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-primary/8 p-8 space-y-2">
                  <p className="text-5xl font-light text-primary">{calWpm}</p>
                  <p className="text-sm text-primary/70">words per minute</p>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Your practice now moves at your speed.
                </p>
              </div>
            )}
          </div>
        </StepContainer>
      )}

      {/* ─── STEP 3: Activation ─── */}
      {step === 3 && (
        <StepContainer stepKey="activate">
          <div className="mb-10">
            {/* Subtle celebratory glow */}
            <div className="relative w-20 h-20 mx-auto mb-10">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="absolute inset-2 rounded-full bg-primary/15 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-foreground leading-tight mb-5">
              You're Ready.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Press record and speak your first affirmation.
            </p>
          </div>
        </StepContainer>
      )}

      {/* ─── Bottom actions ─── */}
      <div className="w-full max-w-md mx-auto px-8 pb-14 space-y-3">
        {step === 0 && (
          <Button
            onClick={next}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            Set Up My Practice
          </Button>
        )}

        {step === 1 && (
          <Button
            onClick={next}
            size="lg"
            className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
          >
            This Feels Right
          </Button>
        )}

        {step === 2 && (
          <>
            {calPhase === "done" ? (
              <Button
                onClick={next}
                size="lg"
                className="w-full h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
              >
                Perfect
              </Button>
            ) : calPhase === "idle" ? (
              <button
                onClick={next}
                className="w-full text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
              >
                Skip for now
              </button>
            ) : null}
          </>
        )}

        {step === 3 && (
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
