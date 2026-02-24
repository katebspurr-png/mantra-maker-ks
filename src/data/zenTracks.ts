/**
 * Background Sound Tracks
 * 
 * Ambient tracks for background playback during recording listening.
 * All tracks require attribution per their Creative Commons licenses.
 * 
 * Tracks are hosted in the zen-tracks Supabase storage bucket.
 */

export interface ZenTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  /** Optional short preview clip URL (10s). Falls back to main url. */
  previewUrl?: string;
  durationSeconds: number;
  license: string;
  attribution: string;
  /** Emoji icon shown in the picker */
  icon: string;
}

const BUCKET_BASE = "https://uwzjdosvirwzgbiouzcd.supabase.co/storage/v1/object/public/zen-tracks";

export const ZEN_TRACKS: ZenTrack[] = [
  {
    id: "mantra",
    title: "Zen Ambient",
    artist: "Alex-Productions",
    url: `${BUCKET_BASE}/mantra.mp3`,
    durationSeconds: 517,
    license: "CC BY 3.0",
    attribution: "MANTRA by Alex-Productions | https://onsound.eu/ | Music promoted by https://www.chosic.com/free-music/all/ | Creative Commons CC BY 3.0",
    icon: "🧘",
  },
  {
    id: "rain",
    title: "Rain",
    artist: "Pixabay",
    url: `${BUCKET_BASE}/rain.mp3`,
    durationSeconds: 600,
    license: "Pixabay License",
    attribution: "Rain ambient sound from Pixabay",
    icon: "🌧️",
  },
  {
    id: "ocean",
    title: "Ocean Waves",
    artist: "Pixabay",
    url: `${BUCKET_BASE}/ocean.mp3`,
    durationSeconds: 600,
    license: "Pixabay License",
    attribution: "Ocean waves ambient sound from Pixabay",
    icon: "🌊",
  },
  {
    id: "bowls",
    title: "Singing Bowls",
    artist: "Pixabay",
    url: `${BUCKET_BASE}/bowls.mp3`,
    durationSeconds: 600,
    license: "Pixabay License",
    attribution: "Singing bowls ambient sound from Pixabay",
    icon: "🔔",
  },
  {
    id: "piano",
    title: "Soft Piano",
    artist: "Pixabay",
    url: `${BUCKET_BASE}/piano.mp3`,
    durationSeconds: 600,
    license: "Pixabay License",
    attribution: "Soft piano ambient music from Pixabay",
    icon: "🎹",
  },
];

/** Special ID representing "no background sound" */
export const NONE_TRACK_ID = "none";
