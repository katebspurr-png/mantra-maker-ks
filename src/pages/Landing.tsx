import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Play, ListMusic, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Mic className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
          Mantra Maker
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-sm">
          Record affirmations in your own voice and listen on loop. A calm space for building positive beliefs.
        </p>

        <div className="w-full space-y-3 max-w-sm">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg gap-2"
            onClick={() => navigate("/demo")}
          >
            <Play className="w-5 h-5" />
            Try Demo
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Feature highlights */}
      <div className="px-6 pb-12 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Mic, label: "Record mantras" },
            { icon: Play, label: "Loop & listen" },
            { icon: ListMusic, label: "Build playlists" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
            >
              <Icon className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
