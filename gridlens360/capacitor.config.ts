import type { CapacitorConfig } from "@capacitor/cli";

// GridLens 360 — native shell configuration.
// Matches the registered Apple identifiers exactly:
//   App name ...... GridLens 360
//   Bundle ID ..... com.mohamedalsaeed.gridlens360
//   Team ID ....... Y94NRXX75N  (set in Xcode → Signing & Capabilities)
const config: CapacitorConfig = {
  appId: "com.mohamedalsaeed.gridlens360",
  appName: "GridLens 360",
  webDir: "dist",
  backgroundColor: "#04101c",
  loggingBehavior: "none",
  ios: {
    contentInset: "always",
    backgroundColor: "#04101c",
  },
  android: {
    backgroundColor: "#04101c",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: "#04101c",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#04101c",
    },
  },
};

export default config;
