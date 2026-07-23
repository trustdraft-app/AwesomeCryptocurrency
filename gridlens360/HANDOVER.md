# GridLens 360 — End-to-End Handover

**Classification: Confidential — Internal.** This bundle contains a complete, buildable
executive mobile application. Treat it as sensitive: it reflects National Grid SA
operational data and is intended only for authorised leadership distribution via TestFlight.

---

## 1. What you have received

A single self-contained project, `gridlens360/`, that builds into:
- a native **iOS** app (Xcode project) for iPhone, and
- a native **Android** app (Android Studio project),

both wrapping one shared, verified user interface. Everything needed to build and ship is
included **except** `node_modules/` (restored in one command) and regenerated build output.

### Directory map
```
gridlens360/
├── src/                     # The application (React + TypeScript)
│   ├── data/grid.ts         # ← the single source of truth for all numbers
│   ├── screens/             # Command, Peak, Power, Clean, Assets
│   ├── components/          # charts, gauges, map, KPI tiles, shell (hand-built SVG)
│   ├── lib/format.ts        # number/trend/health formatting
│   └── styles/              # dark control-room design system
├── ios/                     # ← Native Xcode project (open App.xcworkspace)
├── android/                 # ← Native Android Studio project
├── assets/                  # icon.png (1024) + splash.png sources
├── public/icon.svg          # brand mark
├── capacitor.config.ts      # native shell config (appId, name, colors)
├── index.html, vite.config.ts, tsconfig.json, package.json
├── README.md                # product + architecture overview
├── TESTFLIGHT.md            # the exact archive → upload → TestFlight runbook
└── HANDOVER.md              # this document
```

---

## 2. What it does — five executive lenses

Merged intelligently from your three dashboards + the BESS/Renewable KPI workbook:

| Tab | Source(s) | The one question it answers at a glance |
|-----|-----------|------------------------------------------|
| **Command** | Grid Summary v17 + EOA | "How is the whole Kingdom right now, and how close are we to the record?" |
| **Peak** | EOA System Peak 3.3.0 | "What is the Eastern-area peak today vs yesterday, and is the system stable?" |
| **Power** | EOA System Peak 3.3.0 | "Do we have enough generation and reserve, and are interchanges within limits?" |
| **Clean** | KPI workbook + Grid Summary | "How much renewable and storage is contributing, and how is the fleet cycling?" |
| **Assets** | Firm Capacity v6.7.0 | "Which substations are close to their firm (N-1) capacity?" |

---

## 3. Registered Apple identity — already wired in

No manual setup of these is needed; they are baked into the Xcode project:

| Field | Value |
|-------|-------|
| App name | **GridLens 360** |
| Bundle Identifier | `com.mohamedalsaeed.gridlens360` |
| Apple Team | Mohamed Alsaeed — `Y94NRXX75N` |
| Version / Build | `1.0` / `1` |
| SKU | `GRIDLENS360-IOS-001` |
| Signing | Automatic |

Android mirrors the same: `applicationId com.mohamedalsaeed.gridlens360`, name "GridLens 360",
versionName 1.0, versionCode 1.

---

## 4. Build and run it (5 commands)

On any machine with Node 20+:
```bash
cd gridlens360
npm install          # restores node_modules
npm run dev          # → opens the app in your browser to preview instantly
npm run build        # → produces dist/ (the bundled web build)
```
To refresh the native apps after any change:
```bash
npx cap sync         # copies dist/ into ios/ and android/  (pod install is macOS-only)
```

## 5. Ship it to your executives — see `TESTFLIGHT.md`

The runbook is exact and ordered. The short version (all **macOS + Xcode**, which cannot be
done on Linux/CI):
1. `npm install && npm run build && npx cap sync ios`
2. `npx cap open ios` → verify signing auto-fills to your team.
3. App Store Connect → create the app record (Bundle ID + SKU above).
4. Xcode → **Product → Archive** → **Distribute → App Store Connect → Upload**.
5. TestFlight → **Internal** testers (instant) → then **External** group for the executives
   (first build gets a short Apple beta review, usually < 24h).

---

## 6. Critical notes — read before distributing to leadership

1. **The data is an authoritative offline SNAPSHOT, not live.** This is deliberate: a
   TestFlight build cannot reach your SCADA / PI network. The app shows an amber **SNAPSHOT**
   badge and an "as of 19 Jul 2026 · 15:58 KSA" timestamp on every screen, so no viewer is
   ever misled into thinking it is real-time. All headline figures trace to the cached PI
   samples and the KPI workbook in your source files.
   - To make it **live**, the production path is already defined in the source projects:
     bind `src/data/grid.ts` to the operator's internal OSIsoft **PI Web API** endpoint
     (host/data-server configured out-of-band, not committed to source). That requires a
     secure network path + authentication and is
     a separate, scoped piece of work — do not distribute a "live" claim until that exists.

2. **Firm-capacity substation rows are representative** (labelled in-app on the Assets screen)
   pending the live PI/AF bind. Every other number is derived from your real data.

3. **Distribution scope.** Because the content is operationally sensitive, keep it on
   TestFlight (internal, then a named external group) — not a public App Store release —
   until you decide otherwise. The registration reflects this ("Final distribution: Undecided").

4. **No secrets are in this bundle.** There are no API keys, certificates, provisioning
   profiles, passwords, or internal credentials — consistent with your registration (automatic
   signing, no manual certs, API access not enabled). Xcode mints the signing certificate on
   first archive.

5. **iOS privacy manifest is included.** `ios/App/App/PrivacyInfo.xcprivacy` declares no
   tracking, no data collection, and the one required-reason API used (UserDefaults, reason
   `CA92.1`) — it is already registered in the Xcode project's Copy Bundle Resources, so
   TestFlight will not send "missing privacy manifest" (ITMS-91053) warnings. iPhone-only
   (`TARGETED_DEVICE_FAMILY = "1"`) so App Review does not evaluate an untested iPad layout.

## 6a. Before promoting Android beyond internal testing (Play production)

The Android project targets **API 34**, which is fine for **Google Play internal testing**
(exempt from the target-API gate). Before a **closed/open/production** Play release, Google
requires **API 35**. That is a coordinated toolchain bump that must be built and tested on a
real Android toolchain (not done here, to avoid shipping an unverified build):

- `android/variables.gradle`: `compileSdkVersion = 35`, `targetSdkVersion = 35`
- `android/build.gradle`: Android Gradle Plugin `8.6.0`+ (35 support)
- `android/gradle/wrapper/gradle-wrapper.properties`: Gradle `8.7`+
- then `npx cap sync android` and rebuild/verify the AAB.

iOS/Apple is unaffected; the iPhone/TestFlight path needs none of this.

---

## 7. Verification performed (evidence)

- `tsc --noEmit` — **clean, 0 errors** (strict mode, no unused locals/params).
- `vite build` — **passes**, ~106 KB gzipped.
- All five screens **rendered and visually inspected** at iPhone 15 Pro resolution
  (393×852); no runtime or console errors.
- Native projects generated by Capacitor and audited: iOS bundle id, team, version/build,
  display name, and Android applicationId/version/name all confirmed correct.
- App icon is a 1024×1024 **RGB (no alpha)** PNG — compliant with App Store requirements.

---

*Developed for National Grid SA — Transmission Grid Operator, Digitalization Team.
GridLens 360 · Real-Time Grid Intelligence.*
