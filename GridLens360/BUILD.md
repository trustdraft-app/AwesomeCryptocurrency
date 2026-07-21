# GridLens 360 — Build, Archive & TestFlight Guide

This is the exact path from source to a TestFlight build the C-level testers can install.
It matches the Apple configuration you provided.

## 0. What you are building

- **App name:** GridLens 360
- **Subtitle:** Real-Time Grid Intelligence
- **Bundle Identifier:** `com.mohamedalsaeed.gridlens360`
- **SKU:** `GRIDLENS360-IOS-001`
- **Apple Developer Team:** Mohamed Alsaeed — Team ID `Y94NRXX75N`
- **Version / Build:** `1.0` / `1`
- **Signing:** Automatically managed by Xcode
- **Distribution:** Manual archive & upload through Xcode → TestFlight (internal first, then external)

The project is already wired with every one of these values (see
`GridLens360.xcodeproj/project.pbxproj`). You should not need to type them again — just
confirm and archive.

## 1. Requirements (on your Mac)

- macOS 14 Sonoma or later
- **Xcode 16 or later** (the project uses Xcode 16 file-system-synchronized groups —
  `objectVersion = 77`). If Xcode is older, upgrade before opening.
- You signed in to Xcode with the Apple ID `md.alsaeed3@gmail.com`
  (Xcode ▸ Settings ▸ Accounts). The `Mohamed Alsaeed (Y94NRXX75N)` team must appear there.

## 2. Open the project

```bash
open GridLens360/GridLens360.xcodeproj
```

Xcode will index the `GridLens360/` source folder automatically (synchronized group — all
Swift files and the asset catalog are picked up without manual references).

## 3. Confirm signing (should already be correct)

1. Select the **GridLens360** project ▸ **GridLens360** target ▸ **Signing & Capabilities**.
2. Confirm **Automatically manage signing** is checked.
3. Confirm **Team = Mohamed Alsaeed (Y94NRXX75N)**.
4. Confirm **Bundle Identifier = com.mohamedalsaeed.gridlens360**.

Xcode will create the development & distribution certificates and the provisioning profile
for you the first time — no manual certificates or profiles are needed (this matches your
"do not create manual certificates / profiles" plan).

## 4. Register the app in App Store Connect (one time)

Before the first upload, create the app record at https://appstoreconnect.apple.com ▸
**Apps ▸ +** :

| Field | Value |
|---|---|
| Platform | iOS |
| Name | GridLens 360 |
| Primary language | English (U.S.) |
| Bundle ID | com.mohamedalsaeed.gridlens360 |
| SKU | GRIDLENS360-IOS-001 |

(The numeric App Store Connect Apple ID is assigned by Apple when the record is created —
the one you referenced is `6792842711` / App ID reference; confirm it on the record.)

## 5. Archive

1. In the scheme/destination selector choose **Any iOS Device (arm64)** (not a simulator —
   archives require a device destination).
2. Menu ▸ **Product ▸ Archive**.
3. When it finishes, the **Organizer** opens with the archive.

## 6. Upload to TestFlight

1. In Organizer select the archive ▸ **Distribute App**.
2. Choose **App Store Connect** ▸ **Upload**.
3. Keep the defaults (automatically manage signing).
4. **Export compliance:** when asked, this app uses only standard/exempt encryption
   (HTTPS-class, no custom cryptography) and is fully offline — answer **No** to
   "uses non-exempt encryption". (If you prefer to bake the answer in and skip the prompt,
   add `ITSAppUsesNonExemptEncryption = NO` in an `Info.plist` — not required.)
5. Upload. Processing on App Store Connect takes a few minutes.

## 7. TestFlight distribution to the C-level

1. App Store Connect ▸ your app ▸ **TestFlight**.
2. **Internal Testing:** add the executives as Users (App Store Connect roles) or to an
   internal group — internal testers get the build immediately with no review.
3. **External Testing:** create an external group, add the ministers / board members by
   email, and submit the build for **Beta App Review** (first external build only). Once
   approved, send the invitations — testers install via the TestFlight app.

Because the data is sensitive, keep distribution to **invited testers only**; do not enable
a public TestFlight link.

## 8. What the app contains (for your data-privacy answers)

- **Fully offline.** No network calls, no analytics, no tracking, no accounts. The data is a
  frozen, bundled telemetry snapshot.
- App Privacy ▸ **Data Not Collected**.
- No location, no contacts, no permissions requested.

## 9. Shipping a later version

Bump `MARKETING_VERSION` (e.g. `1.1`) and/or `CURRENT_PROJECT_VERSION` (build number) in the
target build settings, then re-archive. Never reuse a build number for the same version.
