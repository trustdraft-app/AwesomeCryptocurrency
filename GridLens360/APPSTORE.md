# GridLens 360 — App Store Connect & TestFlight submission kit

Everything you paste into App Store Connect after the Xcode archive uploads.
Fields are pre-filled to match your Apple configuration. Sensitive-data notes are
called out — this app shows nation-level grid telemetry, so keep the **public**
listing generic and keep real distribution **invite-only TestFlight**.

> Reminder on sensitivity: the app's *content* is sensitive, but an App Store
> *listing* is public. Nothing below discloses specific megawatt figures, the
> operator's name, or station identifiers. Keep it that way if you ever move past
> TestFlight.

---

## 1. App record (App Store Connect ▸ My Apps ▸ +)

| Field | Value |
|---|---|
| Platform | iOS |
| Name | **GridLens 360** |
| Subtitle | **Real-Time Grid Intelligence** *(27 / 30 chars)* |
| Primary language | English (U.S.) |
| Bundle ID | `com.mohamedalsaeed.gridlens360` |
| SKU | `GRIDLENS360-IOS-001` |
| Primary category | **Business** |
| Secondary category | **Utilities** |
| Age rating | **4+** (no objectionable content) |
| Price | Free |

## 2. Version information (1.0)

**Promotional text** *(≤170 chars — editable without review)*
```
An executive, at-a-glance dashboard for transmission-grid operations: demand,
generation, frequency, interchange corridors, renewables and reserves.
```

**Description** *(≤4000 chars — deliberately generic, no sensitive specifics)*
```
GridLens 360 is a boardroom-grade executive dashboard for transmission-grid
operations. It presents a whole operating area — demand, generation, system
frequency, interchange across boundary corridors, renewables, battery storage and
national reserves — in a single, glance-legible instrument built for executives,
directors and senior officials.

Every figure is presented with its source identifier and reading time, so a
decision-maker always knows what a number is and when it was measured. Headline
totals are re-derived from their parts inside the app and shown auditing
themselves, so the board can trust the arithmetic at a glance.

FIVE BOARDS
• Command — the four headline indicators, the export balance, and the operating-
  day demand curve.
• Corridors — signed net interchange across each boundary, with metered detail and
  clear partial-versus-boundary notes. Flow direction is computed from the
  measured sign, never asserted.
• Kingdom — a six-area national schematic with animated inter-area flows, demand
  markers, area own-peaks and the national reserve stack.
• Sources — renewables, battery storage and partner data-exchange interfaces.
• Ledger — the numbers auditing themselves, an honest-limits register and full
  provenance.

DESIGNED FOR THE BOARDROOM
• A calm, high-contrast operations theme tuned for a glance and for a projector.
• Live motion — count-up indicators, flowing corridors, animated gauges and
  schematic — that communicates state instantly without clutter.
• Telemetry-framed and honest: it is clearly stamped as a snapshot, labels its
  own rounding, and never overstates precision.

GridLens 360 is fully offline. It collects no data, requires no account, and
requests no permissions.
```

**Keywords** *(≤100 chars, comma-separated, no spaces after commas)*
```
grid,transmission,dashboard,SCADA,telemetry,power,energy,utility,operations,executive,demand,frequency
```

**What's New in This Version** *(1.0)*
```
Initial release.
```

**Support URL** *(required)* — `‹add your support page or a mailto: link›`
**Marketing URL** *(optional)* — leave blank
**Copyright** — `2026 Mohamed Alsaeed`

## 3. App Privacy (Data Collection)

Answer the App Privacy questionnaire as **Data Not Collected**:
- "Do you or your third-party partners collect data from this app?" → **No**.
- No tracking, no analytics, no third-party SDKs, no accounts, no device
  identifiers leave the device. The dataset is bundled and read-only.

**Privacy Policy URL** *(required to submit to the App Store; NOT required for
TestFlight internal testing)* — `‹add a one-line policy stating the app collects
no data›`. A compliant policy can be a single sentence: "GridLens 360 does not
collect, transmit, or share any personal data."

## 4. Export compliance (asked at every upload)

- "Does your app use encryption?" → the app uses **no non-exempt encryption**; it
  makes no custom cryptography and is fully offline. Answer **No** to
  non-exempt encryption.
- To stop the question appearing on every build, add
  `ITSAppUsesNonExemptEncryption = NO` to an `Info.plist` (optional — see BUILD.md).

## 5. TestFlight

**Beta App Description** *(shown to external testers)*
```
Executive dashboard for transmission-grid operations. Review the five boards for
clarity at a glance, the readability of every indicator, and the accuracy of the
figures and their source labels.
```

**Beta App Feedback email** — `md.alsaeed3@gmail.com`

**What to Test** *(build 1)*
```
Please review, on your device:
1. Command — do the four headline indicators and the export balance read clearly
   at a glance?
2. Corridors — expand a corridor's metered legs; are the direction, magnitude and
   notes clear?
3. Kingdom — does the six-area schematic and the reserve stack read at a glance?
4. Sources & Ledger — check the renewables and battery figures and the self-audit.
5. General — legibility, motion, and anything that reads as unclear or wrong.
Report anything that looks off in a figure, a label, or the layout on your device.
```

**Test plan**
1. **Internal testing first** — add the executives as App Store Connect users (or
   to an internal group). Internal builds are available immediately, no review.
2. **External testing next** — create an external group, add ministers / board
   members by email, submit build 1 for **Beta App Review** (first external build
   only). Keep it a private group with invitations — **do not** enable a public
   TestFlight link, given the sensitive data.

**Sign-in required?** No. No demo account needed.

## 6. App Review notes (if/when you submit to the App Store)

```
GridLens 360 is a fully-offline executive dashboard. It requires no sign-in,
collects no data, and needs no special configuration — launch and browse the five
tabs. All data is a bundled, read-only snapshot. No login or demo account is
required.
```

## 7. Screenshots

App Store screenshots (required for App Store submission; optional for TestFlight)
are provided under `docs/appstore/` at the 6.7-inch size (1290 × 2796), which
App Store Connect up-scales to the other required sizes. Five images, one per
board.
