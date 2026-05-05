import { useState } from "react";
import JSZip from "jszip";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Recording = {
  id: string;
  title: string;
  audio_file_path: string;
  duration_seconds: number;
  created_at: string;
  tags: string[] | null;
};

type SignedUrl = { path: string | null; signedUrl: string | null; error: string | null };

function sanitize(name: string) {
  return (name || "untitled").replace(/[^\w\s.-]/g, "_").trim().slice(0, 80) || "untitled";
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function ExportLibraryButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleExport = async () => {
    setBusy(true);
    setProgress(0);
    setStatus("Preparing export…");
    try {
      const { data, error } = await supabase.functions.invoke("export-user-recordings", {
        body: {},
      });
      if (error) throw error;

      const recordings: Recording[] = data?.recordings ?? [];
      const urls: SignedUrl[] = data?.urls ?? [];
      if (recordings.length === 0) {
        toast({ title: "No recordings to export" });
        setBusy(false);
        setProgress(0);
        setStatus("");
        return;
      }

      const urlByPath = new Map(urls.filter((u) => u.signedUrl).map((u) => [u.path, u.signedUrl!]));
      const zip = new JSZip();
      const folder = zip.folder("recordings")!;
      const csvRows: string[] = ["id,title,filename,duration_seconds,created_at,tags"];

      let done = 0;
      const total = recordings.length;

      for (const rec of recordings) {
        const ext = rec.audio_file_path.split(".").pop() || "webm";
        const datePart = rec.created_at.slice(0, 10);
        const filename = `${datePart}_${sanitize(rec.title)}_${rec.id.slice(0, 8)}.${ext}`;
        const tags = (rec.tags ?? []).join(",");
        csvRows.push(
          [rec.id, rec.title, filename, rec.duration_seconds, rec.created_at, tags]
            .map((v) => csvEscape(String(v ?? "")))
            .join(",")
        );

        const url = urlByPath.get(rec.audio_file_path);
        setStatus(`Downloading ${done + 1} of ${total}…`);
        if (url) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              folder.file(filename, blob);
            }
          } catch (e) {
            console.warn("Failed to fetch recording", filename, e);
          }
        }
        done += 1;
        setProgress(Math.round((done / total) * 90));
      }

      zip.file("recordings_index.csv", csvRows.join("\n"));
      setStatus("Packaging ZIP…");
      const blob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE" },
        (meta) => setProgress(90 + Math.round(meta.percent * 0.1))
      );

      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mantra-library-${stamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setStatus("");
      setProgress(0);
      toast({ title: "Library exported", description: `${total} recording${total === 1 ? "" : "s"} downloaded.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Export failed", description: String((e as Error)?.message ?? e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-sm">Export Library</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Download all your recordings as a ZIP, with a CSV index of titles, dates, and tags.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={handleExport}
            disabled={busy}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {busy ? "Exporting…" : "Export Library"}
          </Button>
          {busy && (
            <div className="mt-3 space-y-1.5">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}