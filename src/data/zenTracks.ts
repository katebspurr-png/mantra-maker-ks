/**
 * Background Sound Tracks
 * 
 * Ambient tracks for background playback during recording listening.
 * All tracks require attribution per their Creative Commons licenses.
 * 
 * Tracks are hosted in the zen-tracks Supabase storage bucket.
 */

export type ZenTrackCategory = "music" | "sound";

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
  /** Category: "music" tracks appear inside the Music tile dropdown, "sound" tracks are standalone tiles */
  category: ZenTrackCategory;
}

const BUCKET_BASE = "https://uwzjdosvirwzgbiouzcd.supabase.co/storage/v1/object/public/zen-tracks";

/** Music tracks — shown inside the expandable Music tile */
export const MUSIC_TRACKS: ZenTrack[] = [
  {
    id: "mantra",
    title: "Zen Ambient",
    artist: "Alex-Productions",
    url: `${BUCKET_BASE}/mantra.mp3`,
    durationSeconds: 517,
    license: "CC BY 3.0",
    attribution: "MANTRA by Alex-Productions | https://onsound.eu/ | Music promoted by https://www.chosic.com/free-music/all/ | Creative Commons CC BY 3.0",
    icon: "🧘",
    category: "music",
  },
  {
    id: "moonlight",
    title: "Moonlight",
    artist: "Scott Buckley",
    url: `${BUCKET_BASE}/moonlight.mp3`,
    durationSeconds: 254,
    license: "CC BY 4.0",
    attribution: "Moonlight by Scott Buckley | www.scottbuckley.com.au | Music promoted by https://www.chosic.com/free-music/all/ | Creative Commons CC BY 4.0",
    icon: "🌙",
    category: "music",
  },
  {
    id: "transcendence",
    title: "Transcendence",
    artist: "Alexander Nakarada",
    url: `${BUCKET_BASE}/transcendence.mp3`,
    durationSeconds: 823,
    license: "CC BY 4.0",
    attribution: "Transcendence by Alexander Nakarada | https://creatorchords.com | Music promoted by https://www.chosic.com/free-music/all/ | Creative Commons CC BY 4.0",
    icon: "✨",
    category: "music",
  },
];

/** Sound tracks — each gets its own tile */
export const SOUND_TRACKS: ZenTrack[] = [
  {
    id: "rain",
    title: "Rain",
    artist: "Pixabay",
    url: `${BUCKET_BASE}/rain.mp3`,
    durationSeconds: 600,
    license: "Pixabay License",
    attribution: "Rain ambient sound from Pixabay",
    icon: "🌧️",
    category: "sound",
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
    category: "sound",
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
    category: "sound",
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
    category: "sound",
  },
];

/** All tracks combined */
export const ZEN_TRACKS: ZenTrack[] = [...MUSIC_TRACKS, ...SOUND_TRACKS];

/** Special ID representing "no background sound" */
export const NONE_TRACK_ID = "none";

/** Default music track ID */
export const DEFAULT_MUSIC_TRACK_ID = "mantra";
