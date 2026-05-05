import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mic, Sparkles, ChevronRight, Bell, Volume2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoopMode, TimerMode } from "@/types";
import { NotificationSettings } from "@/components/NotificationSettings";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ColorThemeSelector } from "@/components/ColorThemeSelector";
import { Switch } from "@/components/ui/switch";
import { CalibrationDialog } from "@/components/CalibrationDialog";
import { format } from "date-fns";
import { ExportLibraryButton } from "@/components/ExportLibraryButton";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultLoopMode, setDefaultLoopMode] = useState<LoopMode>("infinite");
  const [timerMode, setTimerMode] = useState<TimerMode>("none");
  const [customMinutes, setCustomMinutes] = useState("");
  const [zenAutoSave, setZenAutoSave] = useState(() => {
    return localStorage.getItem("zen-auto-save-enabled") !== "false";
  });
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibratedWpm] = useState<number | null>(() => {
    const saved = localStorage.getItem("teleprompter_calibrated_wpm");
    return saved ? parseInt(saved, 10) : null;
  });
  const [calibratedAt] = useState<string | null>(() => {
    return localStorage.getItem("teleprompter_calibrated_at");
  });
  useEffect(() => {
    fetchProfile();
    // Load default loop mode from localStorage
    const savedMode = localStorage.getItem("defaultLoopMode") as LoopMode;
    if (savedMode) {
      setDefaultLoopMode(savedMode);
    }
    // Load timer settings
    const savedTimerMode = localStorage.getItem("defaultTimerMode") as TimerMode;
    const savedCustomMinutes = localStorage.getItem("defaultCustomMinutes");
    if (savedTimerMode) {
      setTimerMode(savedTimerMode);
    }
    if (savedCustomMinutes) {
      setCustomMinutes(savedCustomMinutes);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setFirstName(profile.first_name || "");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLoopModeChange = (mode: LoopMode) => {
    setDefaultLoopMode(mode);
    localStorage.setItem("defaultLoopMode", mode);
    toast({ title: "Default loop mode updated" });
  };

  const handleTimerModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    localStorage.setItem("defaultTimerMode", mode);
    if (mode !== "custom") {
      toast({ title: `Timer set to ${mode === "none" ? "no limit" : mode + " minutes"}` });
    }
  };

  const handleCustomMinutesChange = (value: string) => {
    const num = value.replace(/\D/g, "");
    setCustomMinutes(num);
    if (num) {
      localStorage.setItem("defaultCustomMinutes", num);
      toast({ title: `Custom timer set to ${num} minutes` });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Profile</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Manage your account and preferences
        </p>

        {/* User Info */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {firstName.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium">{firstName || "User"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => navigate("/thought-rewriter")}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left">Thought Rewriter</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <FeedbackModal />
        </div>

        {/* Color Theme */}
        <div className="mb-6">
          <ColorThemeSelector />
        </div>

        {/* Settings */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-medium mb-4">Default Loop Mode</h2>
          <RadioGroup
            value={defaultLoopMode}
            onValueChange={(v) => handleLoopModeChange(v as LoopMode)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="once" id="once" />
              <Label htmlFor="once">Play once</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="three_times" id="three_times" />
              <Label htmlFor="three_times">Loop 3 times</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="infinite" id="infinite" />
              <Label htmlFor="infinite">Loop until stopped</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Timer Settings - only show when loop mode is infinite */}
        {defaultLoopMode === "infinite" && (
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <h2 className="font-medium mb-4">Playback Timer</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Auto-stop playback after a set duration
            </p>
            <RadioGroup
              value={timerMode}
              onValueChange={(v) => handleTimerModeChange(v as TimerMode)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="timer-none" />
                <Label htmlFor="timer-none">No timer (manual stop)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="timer-5" />
                <Label htmlFor="timer-5">5 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="timer-10" />
                <Label htmlFor="timer-10">10 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="timer-15" />
                <Label htmlFor="timer-15">15 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="timer-custom" />
                <Label htmlFor="timer-custom">Custom</Label>
              </div>
            </RadioGroup>
            {timerMode === "custom" && (
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter minutes"
                  value={customMinutes}
                  onChange={(e) => handleCustomMinutesChange(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            )}
          </div>
        )}

         {/* Notification Settings */}
         <div className="mb-6">
           <NotificationSettings />
         </div>

         {/* Background Sounds Settings */}
         <div className="bg-card rounded-xl border border-border p-4 mb-6">
           <div className="flex items-start gap-3">
             <Volume2 className="w-5 h-5 text-muted-foreground mt-0.5" />
             <div className="flex-1">
               <div className="flex items-center justify-between">
                 <h3 className="font-medium text-sm">Auto-save sound preferences</h3>
                 <Switch
                   checked={zenAutoSave}
                   onCheckedChange={(checked) => {
                     setZenAutoSave(checked);
                     localStorage.setItem("zen-auto-save-enabled", String(checked));
                     if (!checked) {
                       localStorage.removeItem("zen-default-settings");
                     }
                   }}
                 />
               </div>
               <p className="text-sm text-muted-foreground mt-1">
                 Automatically save your background sound choices as the default for new mantras
               </p>
             </div>
           </div>
         </div>

         {/* Teleprompter Speed */}
         <div className="bg-card rounded-xl border border-border p-4 mb-6">
           <div className="flex items-start gap-3">
             <Gauge className="w-5 h-5 text-muted-foreground mt-0.5" />
             <div className="flex-1">
               <h3 className="font-medium text-sm">Teleprompter Speed</h3>
               {calibratedWpm ? (
                 <div className="mt-2 space-y-1.5">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                       Calibrated
                     </span>
                     <span className="text-sm text-foreground font-medium">{calibratedWpm} WPM</span>
                   </div>
                   {calibratedAt && (
                     <p className="text-xs text-muted-foreground">
                       Last calibrated: {format(new Date(calibratedAt), "MMM d, yyyy")}
                     </p>
                   )}
                   <Button
                     variant="outline"
                     size="sm"
                     className="mt-2 gap-2"
                     onClick={() => setShowCalibration(true)}
                   >
                     <Mic className="w-3.5 h-3.5" />
                     Recalibrate
                   </Button>
                 </div>
               ) : (
                 <div className="mt-2 space-y-2">
                   <p className="text-sm text-muted-foreground">
                     Not yet calibrated. Calibrate to match the teleprompter to your natural reading pace.
                   </p>
                   <Button
                     variant="outline"
                     size="sm"
                     className="gap-2"
                     onClick={() => setShowCalibration(true)}
                   >
                     <Mic className="w-3.5 h-3.5" />
                     Calibrate
                   </Button>
                 </div>
               )}
             </div>
           </div>
         </div>

        {/* Mic Info */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Microphone Access</h3>
              <p className="text-sm text-muted-foreground mt-1">
                To record affirmations, allow microphone access when prompted. 
                You can manage permissions in your browser settings.
              </p>
            </div>
          </div>
        </div>

        {/* Export Library */}
        <ExportLibraryButton />

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <CalibrationDialog
        open={showCalibration}
        onOpenChange={setShowCalibration}
        onCalibrated={() => {
          // Force page to reflect new calibration
          window.location.reload();
        }}
      />

      <BottomNavigation />
    </div>
  );
}
