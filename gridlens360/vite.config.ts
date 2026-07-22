import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// GridLens 360 — bundled offline build for Capacitor native shells.
// Relative base so assets resolve inside the iOS/Android WebView (capacitor:// scheme).
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2021",
  },
});
