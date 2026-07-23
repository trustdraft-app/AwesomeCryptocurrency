# GridLens 360 — The Easiest Setup Guide (for the Administrator)

*Plain English. Do the points in order. You do not need to be a developer.*
*Goal: get GridLens 360 onto your executives’ iPhones through Apple TestFlight.*

---

## What you need (gather these first)

- A **Mac computer** (Apple laptop or desktop). This is required — Apple only allows app uploads from a Mac.
- The **Apple ID** for the developer account: `md.alsaeed3@gmail.com` (Mohamed Alsaeed, Team `Y94NRXX75N`).
- The **GridLens360.zip** file (this project).
- About **45 minutes** the first time. Later updates take ~5 minutes.

---

## Part A — One-time preparation on the Mac (~15 min)

1. **Install Xcode.** Open the App Store on the Mac, search **Xcode**, click **Get / Install**. It’s free and large — let it finish.
2. **Open Xcode once**, and when it asks, let it **install additional components**.
3. **Sign in to your Apple account in Xcode:** menu **Xcode → Settings → Accounts → “+” → Apple ID**, sign in with `md.alsaeed3@gmail.com`. You should see the team **Mohamed Alsaeed**.
4. **Install two small helpers.** Open the **Terminal** app (press ⌘-Space, type *Terminal*, Enter) and paste these one at a time, pressing Enter after each:
   - `xcode-select --install`  *(if it says already installed, that’s fine)*
   - `sudo gem install cocoapods`  *(it will ask for your Mac password — type it, press Enter; the typing is invisible, that’s normal)*
5. **Install Node.js.** Go to **nodejs.org**, download the **LTS** version, open the downloaded file, and click through Install.

*You only ever do Part A once.*

---

## Part B — Build the app from the zip (~10 min)

1. **Unzip** GridLens360.zip (double-click it). You now have a folder called **gridlens360**.
2. Open **Terminal** and type `cd ` (the letters c, d, and a space), then **drag the gridlens360 folder onto the Terminal window** and press **Enter**. (This points Terminal at the project.)
3. Paste these three lines, one at a time, Enter after each. Wait for each to finish:
   - `npm install`
   - `npm run build`
   - `npx cap sync ios`
4. Now open the project in Xcode by pasting:
   - `npx cap open ios`
   Xcode opens the GridLens 360 project. Leave it open for Part C.

> If a line ever shows an error, copy the whole message and send it on — don’t guess.

---

## Part C — Send it to Apple (~10 min)

1. **Create the app’s record with Apple** *(only needed the very first time)*:
   - Go to **appstoreconnect.apple.com**, sign in, click **Apps → the blue “+” → New App**.
   - Fill in: Platform **iOS**, Name **GridLens 360**, Language **English (U.S.)**, Bundle ID **com.mohamedalsaeed.gridlens360**, SKU **GRIDLENS360-IOS-001**. Click **Create**.
2. **In Xcode**, at the very top, click the device dropdown and choose **“Any iOS Device (arm64)”** (not a simulator).
3. Menu **Product → Archive**. Wait — a new window (the *Organizer*) opens when it finishes.
4. Click **Distribute App → App Store Connect → Upload**, and keep clicking **Next / Upload** (accept the defaults). It signs and uploads automatically.

*The signing certificate is created for you automatically the first time — you don’t make anything by hand.*

---

## Part D — Invite your executives (~5 min)

1. In **App Store Connect**, open your app → the **TestFlight** tab. Your build shows **“Processing”** for a few minutes, then **“Ready to Test.”**
2. Answer the one **Export Compliance** question if asked → choose **No** (this app uses only standard encryption — this is the normal answer).
3. **Internal testers (you / your team):** under **Internal Testing**, add people who are on your App Store Connect account. They get access **instantly**.
4. **External testers (the executives / minister):** under **External Testing**, create a group (e.g. *Leadership*), **add each person by their email**. Apple does a short one-time review of the first build (usually under a day); after that, invites go out and you can push new builds freely.
5. Each executive gets an email → they open it on their iPhone → **Install**. (Hand them **FOR-EXECUTIVES.md** — it’s their whole guide.)

---

## Sending an updated version later (~5 min)

1. In Xcode, click the project name → find **Build**, and change the number (e.g. **1 → 2**).
2. In Terminal (pointed at the folder): `npm run build` then `npx cap sync ios`.
3. In Xcode: **Product → Archive → Distribute → Upload** (same as Part C, steps 2–4).
4. The new build appears in TestFlight automatically for your testers.

> Rule of thumb: bump the **Build** number every upload. Change the **Version** (1.0 → 1.1) only for a bigger release.

---

## Good to know

- **Android** (Google Play) is optional and secondary. It works the same idea (`npm run build`, then `npx cap sync android`, then open Android Studio and upload). See **HANDOVER.md** section 6a before any Play *production* release.
- **Nothing sensitive is hidden inside this zip** — no passwords, keys, or live grid access. The app ships a safe offline snapshot (the amber **SNAPSHOT** badge). Making it show **live** grid data is a separate project — see **HANDOVER.md**.
- **Deeper detail** for engineers is in **TESTFLIGHT.md** and **HANDOVER.md**. This page is the easy path; those are the reference.
