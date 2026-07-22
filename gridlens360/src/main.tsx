import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles/theme.css";
import "./styles/components.css";

// Native shell polish (no-ops on web).
async function initNative() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* running on web — ignore */
  }
}
initNative();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* HashRouter keeps deep links working inside the capacitor:// WebView. */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
