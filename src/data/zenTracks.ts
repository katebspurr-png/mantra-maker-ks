/**
 * Zen Background Music Tracks
 * 
 * Free-to-use ambient tracks for background playback during recording listening.
 * All tracks require attribution per their Creative Commons licenses.
 */

export interface ZenTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  durationSeconds: number;
  license: string;
  attribution: string;
}

export const ZEN_TRACKS: ZenTrack[] = [
  {
    id: "mantra",
    title: "Mantra",
    artist: "Alex-Productions",
    url: "https://www.chosic.com/wp-content/uploads/2022/08/MANTRON(chosic.com).mp3",
    durationSeconds: 517,
    license: "CC BY 3.0",
    attribution: "MANTRA by Alex-Productions | https://onsound.eu/ | Music promoted by https://www.chosic.com/free-music/all/ | Creative Commons CC BY 3.0",
  },
];
