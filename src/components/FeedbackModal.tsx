import { useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const feedbackTypes = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature feedback" },
  { value: "tone", label: "Tone & emotional response" },
  { value: "general", label: "General suggestion" },
] as const;

const placeholders: Record<string, string> = {
  bug: "What happened? What were you trying to do?",
  feature: "Tell us about your experience with this feature",
  tone: "How did the app make you feel?",
  general: "What would make Mantra Maker better for you?",
};

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const typeLabel = feedbackTypes.find((t) => t.value === feedbackType)?.label ?? "";

  const handleSubmit = async () => {
    if (!feedbackType || !feedback.trim()) return;

    setSubmitting(true);
    try {
      const url = new URL(
        "https://docs.google.com/forms/d/e/1FAIpQLScud32h_PlDO1LlQQDmHqUtn9nAUpQkx-7YUQPKXJ5VTTd3FQ/formResponse"
      );
      url.searchParams.set("entry.1959260383", typeLabel);
      url.searchParams.set("entry.1883788478", feedback.trim());
      url.searchParams.set("entry.659725089", email.trim());

      await fetch(url.toString(), { method: "POST", mode: "no-cors" });

      toast({ title: "Thanks for your feedback! 💙" });
      setOpen(false);
      setFeedbackType("");
      setFeedback("");
      setEmail("");
    } catch {
      toast({ title: "Could not send feedback. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
          <MessageSquareHeart className="w-5 h-5 text-primary" />
          <span className="flex-1 text-left">Give Feedback</span>
          <span className="text-muted-foreground text-sm">›</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Give Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type…" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={placeholders[feedbackType] ?? "Select a feedback type above…"}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <p className="text-xs text-muted-foreground">
              If you'd like us to follow up with you about this feedback, you can share your email (completely optional)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!feedbackType || !feedback.trim() || submitting}
            className="w-full"
          >
            {submitting ? "Sending…" : "Send Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
