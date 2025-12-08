import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "Loop Voice Mantra",
        short_name: "Loop Mantra",
        description: "Record affirmations in your own voice and play them on a loop.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#f9a826",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Navigation fallback should NOT apply to API or storage requests
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          // Exclude Supabase API and storage URLs from navigation fallback
          /^\/rest\//,
          /^\/storage\//,
          /supabase\.co/,
        ],
        runtimeCaching: [
          {
            // Cache Supabase REST API calls (metadata, playlists, etc.)
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // AUDIO FILES: Always fetch from network, never cache
            // This ensures signed URLs for audio recordings are always fresh
            // and prevents the service worker from serving stale/expired URLs
            // or incorrectly returning cached HTML for audio requests
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "NetworkOnly"
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
