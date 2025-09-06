# 👗 TailorMitra

Find nearby tailors and manage your bookings — fast, simple, and beautiful.

<p align="center">
  <img src="./assets/images/ChatGPT Image Sep 5, 2025, 10_27_17 PM.png" alt="TailorMitra logo" width="120" />
</p>

<p align="center">
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Built%20with-Expo%2053-1B1F23?logo=expo&logoColor=fff" /></a>
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React%20Native-0.79-blue?logo=react" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?logo=supabase&logoColor=fff" /></a>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-5E5DF0" />
</p>

---

## ✨ Highlights
- One‑tap Google sign‑in via Supabase (Expo Go and standalone supported)
- Explore tailors around you with PIN/place search (Nominatim)
- Quick external navigation: open Google/Apple Maps directly from the app
- Bookings panel with filters, search, status badges, and quick actions
- Polished dark/light themes across the UI

> The Explore screen intentionally opens the device’s Maps app for live results and directions — reliable even on restricted networks.

---

## 📸 Screenshots
<p align="center">
  <!-- Replace with real screenshots when available -->
  <img src="./assets/images/adaptive-icon.png" alt="Home" width="140" />
  <img src="./assets/images/ChatGPT Image Sep 5, 2025, 10_27_17 PM.png" alt="Explore" width="140" />
</p>

---

## 🧩 Features
- Auth
  - Google OAuth (PKCE) with automatic redirect handling (Expo proxy or custom scheme)
  - Session‑aware Profile (email, sign out)
- Explore
  - Search by PIN or place (Nominatim)
  - “My Location” + “Open in Maps” for instant results in native Maps app
- Bookings
  - Filter chips: Upcoming / Past / All
  - Search box for tailor/service
  - Status badges and quick actions (View / Cancel)

---

## 🛠 Tech Stack
- React Native + Expo Router
- Supabase (Auth)
- Nominatim (Geocoding)
- Overpass API (Tailor discovery; UI falls back to external Maps)

---

## 🚀 Getting Started

1) Install dependencies
```bash
npm install
```

2) Run the app (Expo)
```bash
npx expo start
```
- Press `a` for Android, `i` for iOS (Mac), `w` for web
- Or scan the QR in Expo Go on your device

---

## ⚙️ Environment
Environment values are read from `constants/env.ts` and `app.json -> expo.extra`.

Set these public variables (safe for client apps):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Optional: `EXPO_PUBLIC_MAPBOX_TOKEN` (not required since Explore opens external Maps)

Example `app.json` (extra)
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR-SUPABASE-PROJECT.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "YOUR-ANON-KEY",
      "EXPO_PUBLIC_MAPBOX_TOKEN": "pk.your_token_optional"
    }
  }
}
```

---

## 🔐 Google Sign‑In (Supabase)
Works in both Expo Go and standalone builds.

- Expo Go: uses Expo Auth Proxy redirect
- Standalone/dev build: uses custom scheme `tailormitra://`

Supabase → Auth → URL Configuration → Additional Redirect URLs:
- `https://auth.expo.io/@YOUR_USERNAME/TailorMitra` (for Expo Go)
- `tailormitra://` (for standalone/dev)

Google Cloud Console → OAuth:
- Authorized redirect URI (Supabase):
  - `https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
- Copy Client ID & Secret into Supabase → Auth → Providers → Google

Relevant files:
- `lib/supabase.ts`
- `app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`

---

## 🗺 Explore & Maps Behavior
- Enter a PIN or place to position your search area (Nominatim)
- Tap “Open in Maps” or the blue “Maps” button → opens Google/Apple Maps with `tailor` search near your location
- Great coverage and live directions — even if tile servers are blocked

---

## 📦 Scripts
```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

---

## 🏗 Build & Release (EAS)
1) Login
```bash
npx expo login
```

2) Configure EAS
```bash
eas build:configure
```

3) Android APK (preview)
```bash
eas build -p android --profile preview
```

A build URL appears in the terminal; download the APK from there.

> App icon is set in `app.json` → `expo.icon` and `expo.android.adaptiveIcon.foregroundImage`.

---

## 📁 Project Structure
```
app/
  (auth)/            # Sign in / Sign up
  (tabs)/            # Tabs: Explore, Bookings, Profile
assets/              # Images, fonts
components/          # Themed UI, Icons, helpers
constants/           # Colors, env
lib/                 # Supabase client, Nominatim/Overpass
```

---

## 🧭 Roadmap
- Supabase bookings table + details page
- User-added tailors (Supabase) and “report issue”
- Category shortcuts + localized labels (Hindi/English)
- Optional web map using Leaflet

---

## 📜 License
MIT — feel free to fork and build.

---

## 🙌 Credits
- OpenStreetMap, Nominatim, Overpass
- Expo, React Native, Supabase

> Have ideas or found issues? Open a PR or create an issue — contributions are welcome!

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
