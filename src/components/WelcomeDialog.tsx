import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WELCOME_SHOWN_KEY = "welcome_dialog_shown_date";

export function WelcomeDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    // Show dialog once per day
    if (lastShown !== today) {
      setOpen(true);
      localStorage.setItem(WELCOME_SHOWN_KEY, today);
    }
  }, []);

  const handleStart = () => {
    setOpen(false);
    navigate("/thought-rewriter");
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">How are you feeling today?</DialogTitle>
          <DialogDescription className="text-base">
            Share what's on your mind and transform any limiting thoughts into powerful affirmations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleStart} size="lg" className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Start My Journey
          </Button>
          <Button onClick={handleSkip} variant="ghost" size="lg" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
