# GridLens 360 — TestFlight runbook (iOS)

This is the exact, ordered path from this repository to a build your C-level testers
install from TestFlight. Steps that **require macOS + Xcode** are marked 🍎 — they
cannot run on Linux/CI and are done on your Mac. Everything before them is already done
in this repo.

## 0. One-time prerequisites (on your Mac)
- macOS with **Xcode 15+** installed and signed in with Apple ID `md.alsaeed3@gmail.com`
  (Xcode → Settings → Accounts → your **Mohamed Alsaeed** team, ID `Y94NRXX75N`).
- **CocoaPods**: `sudo gem install cocoapods` (or `brew install cocoapods`).
- **Node 20+** and this repo cloned.

## 1. Build the web bundle and sync the native projects
```bash
cd gridlens360
npm install
npm run build          # → dist/
npx cap sync ios       # copies dist/ into ios/ and runs pod install 🍎
```
> `pod install` only succeeds on macOS — that is expected. On Linux `cap sync` copies
> the web assets and skips Pods with a warning; run it again on the Mac to finish.

## 2. (Optional) regenerate polished icons & splash 🍎
The branded 1024 icon and Android densities are already committed. To regenerate every
size from the sources in `assets/` (needs the native image backend, which builds on macOS):
```bash
npx @capacitor/assets generate --iconBackgroundColor '#04101c' --splashBackgroundColor '#04101c'
```

## 3. Open the project in Xcode 🍎
```bash
npx cap open ios       # opens ios/App/App.xcworkspace
```
Confirm under **Signing & Capabilities** (already pre-set, just verify):
- **Automatically manage signing** ✔
- **Team**: Mohamed Alsaeed (`Y94NRXX75N`)
- **Bundle Identifier**: `com.mohamedalsaeed.gridlens360`
- **Display Name**: GridLens 360 · **Version** 1.0 · **Build** 1

Xcode will create the signing certificate and a provisioning profile automatically the
first time (no manual certificates/profiles needed — matches your registration).

## 4. Create the app record in App Store Connect (once)
1. https://appstoreconnect.apple.com → **Apps → +** → **New App**.
2. Platform **iOS**, Name **GridLens 360**, Primary language **English (U.S.)**,
   Bundle ID **com.mohamedalsaeed.gridlens360**, SKU **GRIDLENS360-IOS-001**.
3. Save. (This mints the numeric **App Store Connect Apple ID** — record it; your
   registration currently lists Apple ID `6792842711`.)

## 5. Archive and upload 🍎
1. In Xcode, top device selector → **Any iOS Device (arm64)** (not a simulator).
2. **Product → Archive**. When the Organizer opens on the finished archive:
3. **Distribute App → App Store Connect → Upload** → keep the defaults
   (automatic signing) → **Upload**.

## 6. TestFlight — internal first
1. App Store Connect → your app → **TestFlight** tab. The build appears as *Processing*
   (a few minutes), then *Ready to Test*.
2. Complete **Test Information** and the **Export Compliance** question. This app uses
   only standard HTTPS/OS encryption → answer the encryption question **"No"** to the
   proprietary-encryption prompt (standard exemption).
3. **Internal Testing** → add yourself/your team (App Store Connect users) → they get
   the invite immediately, no review needed.

## 7. TestFlight — external (your executives)
1. **External Testing** → create a group (e.g. *Leadership*).
2. Add the executives by email (they need the free TestFlight app on their iPhone).
3. The **first** external build needs a short **Beta App Review** (usually < 24h);
   afterwards you can send invites and push new builds freely.
4. Testers tap the emailed link → open in TestFlight → **Install**.

## Shipping a new build later
```bash
# bump Build number in Xcode (e.g. 2), then:
npm run build && npx cap sync ios
# Xcode → Product → Archive → Distribute → Upload
```
Increment **Build** every upload; bump **Version** (1.1, 1.2 …) for feature releases.

---

### Android (Google Play internal testing) — parallel path
```bash
npm run build && npx cap sync android
npx cap open android          # Android Studio
# Build → Generate Signed Bundle/APK → Android App Bundle (.aab)
# Play Console → Internal testing → upload the .aab → add testers by email
```
`applicationId`, name, version, and icons are already set to match the iOS identity.

---

**Data note for reviewers.** This build ships an authoritative offline **snapshot**
(shown by the amber *SNAPSHOT* badge and the "as of" timestamp). The production build
binds live to the PI Web API per the source projects; no live SCADA/VPN access is
required to evaluate the app on TestFlight.
