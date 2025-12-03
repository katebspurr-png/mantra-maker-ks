import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mic, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoopMode } from "@/types";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultLoopMode, setDefaultLoopMode] = useState<LoopMode>("infinite");

  useEffect(() => {
    fetchProfile();
    // Load default loop mode from localStorage
    const savedMode = localStorage.getItem("defaultLoopMode") as LoopMode;
    if (savedMode) {
      setDefaultLoopMode(savedMode);
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

      <BottomNavigation />
    </div>
  );
}
