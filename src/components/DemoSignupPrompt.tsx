import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/contexts/DemoContext";

export function DemoSignupPrompt() {
  const { signupPromptOpen, signupFeature, closeSignupPrompt } = useDemoMode();
  const navigate = useNavigate();

  return (
    <Dialog open={signupPromptOpen} onOpenChange={closeSignupPrompt}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-xl">Sign up to unlock</DialogTitle>
          <DialogDescription className="text-base">
            Sign up to {signupFeature || "unlock this feature"}. It only takes a moment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              closeSignupPrompt();
              navigate("/auth");
            }}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={closeSignupPrompt}
          >
            Keep Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
