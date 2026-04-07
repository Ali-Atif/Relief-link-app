# ReliefLink

**ReliefLink** is a React Native app built with **Expo** (SDK 54). It focuses on **disaster / emergency relief** flows: **SOS** (SMS + live location), **emergency contacts** (offline storage), **NGO incident reporting** (offline-first + Firestore), **offline survival guides**, an **offline disaster-awareness quiz**, and **English / Urdu** UI strings.

---

## What this project contains

| Area | Status |
|------|--------|
| **Navigation** | Native stack: auth screens + main app screens |
| **Authentication** | **Firebase Auth** (email/password) + **AsyncStorage** cache for offline-friendly session |
| **SOS** | Large **SOS** on **Home** + **SOS** screen; GPS → Google Maps link → SMS to all saved numbers |
| **Emergency contacts** | **AsyncStorage** (offline, survives restart); **FlatList** UI; add / **delete**; **phone validation** |
| **Survival guides** | **Flood**, **Earthquake**, **Fire** — bundled **`data/guides.json`**, **FlatList** list + detail screen; **no network** |
| **NGO reports** | **Title**, **description**, **location**; **online** → **Firestore**; **offline** → **AsyncStorage** (`pending`); **auto + manual sync** |
| **Connectivity** | **NetInfo** — top banner **“Online”** / **“Offline Mode”** (same rules as report submit + sync) |
| **Quiz** | **MCQs** on flood, earthquake, fire — **`data/quiz.json`** (English + Urdu text); one question per step; **score** at end; **no network** |
| **Languages** | **English** and **Urdu** — `LanguageProvider`, **`i18n/strings.ts`**, choice stored in **`AsyncStorage`** (`relieflink_language`); toggles on **Home** and **Login** |
| **Screens** | Login, Register, Home, SOS, Emergency contacts, Add contact, Report, Guides, Guide detail, **Quiz** |
| **Styling** | `utils/constants`, `ScreenLayout`, `PrimaryButton`, `SosButton` |
| **Services** | Firebase Auth + Firestore, auth cache, contacts, SOS, guides loader, NGO queue + sync |
| **Metro** | `metro.config.js` enables Firebase package **exports** |

---

## Survival guides (offline)

| Feature | Implementation |
|--------|----------------|
| **Content** | Local JSON at **`data/guides.json`** — three topics: Flood, Earthquake, Fire. |
| **List** | **`screens/GuidesScreen.tsx`** uses **`FlatList`** (full-screen scroll, not nested in `ScreenLayout`’s `ScrollView`). |
| **Detail** | **`screens/GuideDetailScreen.tsx`** — large, high-contrast typography for stress reading. |
| **Data access** | **`services/guides.ts`** — `getAllGuides()`, `getGuideById()`. |

**Note:** Guide **titles and paragraphs** in `guides.json` are English only. The app **chrome** (list headings, errors) follows the selected language.

---

## Disaster awareness quiz (offline)

| Feature | Implementation |
|--------|----------------|
| **Content** | **`data/quiz.json`** — each item has **`en`** and **`ur`** blocks (`question` + `options`) and a shared **`correctIndex`**. |
| **Loader** | **`services/quiz.ts`** — `getQuizQuestions(language)` returns localized rows for the active UI language. |
| **UI** | **`screens/QuizScreen.tsx`** — intro → **one MCQ at a time** (A–D options) → **results** with score and percentage; **Try again** / **Back to home**. |
| **Navigation** | **Home** → **Awareness quiz**; stack screen **`Quiz`**. |

---

## Languages (English / Urdu)

| Piece | Role |
|-------|------|
| **`contexts/LanguageContext.tsx`** | `language`, `setLanguage`, `toggleLanguage`, and **`t(key, vars?)`** for placeholders like `{count}`. |
| **`i18n/strings.ts`** | All translated strings for **EN** and **UR**. |
| **`services/languageStorage.ts`** | Loads/saves **`relieflink_language`** (`en` \| `ur`) in AsyncStorage. |
| **`hooks/useTranslatedHeader.ts`** | Updates the stack **header title** when the language changes. |
| **Where to toggle** | **Login** (before sign-in) and **Home** (after sign-in) — single control cycles **English ↔ Urdu**. |

Firebase Auth error messages from the SDK may still appear in **English**.

---

## NGO reporting (offline-first)

| Feature | Implementation |
|--------|----------------|
| **Form** | **`screens/ReportScreen.tsx`** — title, description, location (all required, trimmed). |
| **Online** | Writes to Firestore collection **`ngo_reports`** via **`services/ngoReportsService.ts`** (`addDoc` + `serverTimestamp`, optional `userId`). |
| **Offline** | Saves to AsyncStorage under **`relieflink_pending_ngo_reports`** with **`status: "pending"`** (`services/ngoReportsQueue.ts`). |
| **Sync** | **`components/NgoReportsSyncBridge.tsx`** (mounted in **`App.tsx`**) runs sync when the app becomes active or when **NetInfo** reports connectivity. Opening **Report** also runs sync. **“Sync pending now”** on the Report screen uploads anything still queued. |
| **Feedback** | **Alerts** for success (submitted vs saved offline), validation errors, Firestore failures, and sync results. |

### Firestore setup (for NGO reports)

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Firestore Database** → create database (if needed).
2. Use rules that allow **authenticated** users to **create** documents (adjust to your security model):

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ngo_reports/{docId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

3. Ensure **Authentication** is enabled (email/password) so `request.auth` is set when users submit from the app.

---

## Connectivity (NetInfo)

| Piece | Role |
|-------|------|
| **`@react-native-community/netinfo`** | Subscribes to network state (Wi‑Fi, cellular, offline). |
| **`utils/netInfoOnline.ts`** | `isNetStateOnline()` — `connected` and `isInternetReachable !== false` (matches NGO submit/sync). |
| **`hooks/useNetInfoConnectivity.ts`** | Hook for reactive online/offline in UI. |
| **`components/ConnectivityBanner.tsx`** | Small strip under the status bar: **“Online”** (teal tint) or **“Offline Mode”** (amber tint). Mounted in **`App.tsx`**. |

---

## SOS (emergency) flow

**Exact SMS text** (after GPS succeeds):

```text
I am in danger. My location: https://maps.google.com/?q=LAT,LONG
```

(`LAT` and `LONG` are your current coordinates.)

**Steps when you tap SOS:**

1. **Contacts** — Loads emergency contacts from **AsyncStorage**. If **none** are saved → **alert** (stops before using GPS).
2. **Location** — Requests **foreground** location permission (`expo-location`). If denied or position fails → **alert**.
3. **Map link** — Builds `https://maps.google.com/?q=latitude,longitude`.
4. **SMS** — Calls `SMS.isAvailableAsync()`. If SMS is not supported (common on simulators) → **alert**. Else opens the system SMS composer with **all** saved numbers and the message above.
5. **Loading** — The SOS button shows a **spinner** while this runs (`hooks/useSosEmergency.ts`).

**Permissions:** Location is configured in **`app.json`** (Expo Location plugin + iOS usage strings). Android includes **location** and **SEND_SMS** in permissions. The OS still asks the user when needed.

---

## Emergency contacts module (offline-first)

| Feature | Implementation |
|--------|-------------------|
| **Storage** | JSON array in AsyncStorage under `relieflink_emergency_contacts` (`services/emergencyContactsStorage.ts`). **Persists after app restart.** Works **without internet**. |
| **Add contact** | **Add contact** screen: name + phone. Phone checked with **`utils/phoneValidation.ts`** (8–15 digits, ignoring spaces/`+`/dashes for the count). |
| **List** | **Emergency contacts** screen uses **`FlatList`** (main scroll area is **not** nested inside `ScreenLayout`’s `ScrollView`, so scrolling behaves correctly). |
| **Delete** | Each row has **Delete** → confirmation **alert** → `removeEmergencyContact(id)` → list reloads. |
| **SOS integration** | `sosService.ts` reads the same storage and sends SMS to every saved number. |

---

## Tech stack

- **Expo** ~54, **React Native** 0.81, **React** 19, **TypeScript**
- **React Navigation** (native stack)
- **Firebase** (modular) — Auth + **Firestore**
- **@react-native-async-storage/async-storage** — auth profile, emergency contacts, pending NGO reports, **UI language**
- **@react-native-community/netinfo** — connectivity banner + NGO submit/queue + sync triggers
- **expo-location**, **expo-sms**
- **react-native-safe-area-context**, **react-native-screens**

---

## Setup (required)

### 1. Install dependencies

```bash
cd Disaster-Management-App
npm install
```

### 2. Configure Firebase

1. [Firebase Console](https://console.firebase.google.com/) → your project.
2. Add a **Web** app → copy config into **`services/firebaseConfig.ts`** (replace `YOUR_*` values).
3. **Authentication** → **Sign-in method** → enable **Email/Password**.
4. **Firestore** — enable the database and set **rules** (see NGO reporting section above).

### 3. Metro + Firebase

If you see **`Unable to resolve "firebase/auth"`** (or **`firebase/firestore`**), keep **`metro.config.js`** (package exports enabled) and run:

```bash
npx expo start --clear
```

---

## Authentication & offline (short)

- After a successful Firebase sign-in, a small user profile is cached in AsyncStorage (`authCache.ts`).
- **Emergency contacts** and **pending NGO reports** are stored **locally** and do not require the network except when uploading reports to Firestore.

---

## Project layout

```
├── App.tsx
├── metro.config.js
├── app.json                    # Location plugin, Android SMS + location permissions
├── data/
│   ├── guides.json             # Offline survival guides (Flood, Earthquake, Fire)
│   └── quiz.json               # Bilingual MCQs (en / ur per question)
├── contexts/
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── i18n/
│   ├── strings.ts              # English + Urdu UI copy
│   └── types.ts
├── hooks/useSosEmergency.ts
├── hooks/useNetInfoConnectivity.ts
├── hooks/useTranslatedHeader.ts
├── navigation/
├── screens/
│   ├── HomeScreen.tsx          # Large SosButton
│   ├── ContactsScreen.tsx      # FlatList + delete
│   ├── AddContactScreen.tsx    # Validation
│   ├── GuidesScreen.tsx        # FlatList → GuideDetail
│   ├── GuideDetailScreen.tsx
│   ├── ReportScreen.tsx        # NGO form + sync
│   ├── QuizScreen.tsx          # Offline MCQ flow + score
│   └── …
├── components/
│   ├── SosButton.tsx
│   ├── NgoReportsSyncBridge.tsx
│   ├── ConnectivityBanner.tsx
│   └── …
├── services/
│   ├── firebase.ts             # app, auth, db
│   ├── guides.ts
│   ├── quiz.ts
│   ├── languageStorage.ts
│   ├── ngoReportsService.ts
│   ├── ngoReportsQueue.ts
│   ├── emergencyContactsStorage.ts
│   ├── sosService.ts
│   └── …
├── utils/
│   ├── netInfoOnline.ts
│   ├── phoneValidation.ts
│   ├── authErrors.ts
│   └── constants.ts
└── assets/
```

---

## How to run

```bash
npm install
npx expo start
```

**SMS / SOS:** Use a **physical phone** with SMS when possible; simulators often cannot send SMS.

```bash
npx expo start --clear
```

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| **`Unable to resolve "firebase/auth"`** | `npm install`, keep **`metro.config.js`**, `npx expo start --clear` |
| **Report: permission denied** | Firestore **rules** must allow `create` for signed-in users on **`ngo_reports`** |
| **SOS: SMS not available** | Real device with SMS; many emulators do not support it |
| **SOS: no contacts** | Add at least one contact under **Emergency contacts** |
| **Location errors** | Grant permission; try outdoors for better GPS |

---

## Next steps (ideas)

- Urdu (or bilingual) **survival guide** bodies in `guides.json`.
- Admin dashboard to read `ngo_reports` from Firestore.

---

## License

Private project — use and modify as you like for your own app.
