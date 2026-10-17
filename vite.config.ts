import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/icon-maskable.svg"],
      manifest: {
        name: "Trailhead - Outdoors Lifestyle App",
        short_name: "Trailhead",
        description:
          "Discover Utah trails and parks on an interactive map. Works on desktop, phones, and tablets.",
        theme_color: "#1f6e43",
        background_color: "#0f1b14",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache the app shell + bundled seed data for offline use.
        globPatterns: ["**/*.{js,css,html,svg,ico,json,geojson}"],
        runtimeCaching: [
          {
            // Basemap tiles / glyphs / sprites from MapTiler or OpenFreeMap.
            urlPattern: ({ url }) =>
              url.hostname.includes("maptiler.com") ||
              url.hostname.includes("openfreemap.org"),
            handler: "CacheFirst",
            options: {
              cacheName: "basemap-tiles",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
