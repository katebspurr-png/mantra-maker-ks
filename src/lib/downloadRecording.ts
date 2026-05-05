import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";

function sanitize(name: string) {
  return (name || "untitled").replace(/[^\w\s.-]/g, "_").trim().slice(0, 80) || "untitled";
}

export async function downloadRecording(recording: Pick<Recording, "title" | "audio_file_path" | "created_at" | "id">) {
  const { data, error } = await supabase.storage
    .from("recordings")
    .createSignedUrl(recording.audio_file_path, 300);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not create download link");

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();

  const ext = recording.audio_file_path.split(".").pop() || "webm";
  const datePart = (recording.created_at ?? new Date().toISOString()).slice(0, 10);
  const filename = `${datePart}_${sanitize(recording.title)}_${recording.id.slice(0, 8)}.${ext}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}