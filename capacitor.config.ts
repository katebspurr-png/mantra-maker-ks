import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loopmantra.app',
  appName: 'Loop Voice Mantra',
  webDir: 'dist',
  server: {
    // Allow loading from Supabase and other external origins
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
