# Create a detailed markdown file with a step-by-step Windsurf build strategy for TailorMitra
content = r"""# TailorMitra — Windsurf Build Strategy (Step-by-Step) 📱🧵

A practical, copy‑pastable guide to build **TailorMitra** (React Native **Expo** + **Supabase**) using **Windsurf** (or any AI IDE).  
Focus: **India-first**, low-end phones, offline-friendly, open-source stack.

---

## 0) TL;DR Flow
1. **Bootstrap** Expo app → install deps.  
2. **Wire Supabase** (Auth + DB + Storage).  
3. **Scaffold screens** (Auth, Home/List+Map, Tailor Profile, Booking, My Bookings, Admin Verify).  
4. **Implement search** (GPS + Pincode + Filters).  
5. **Add bookings & reviews**.  
6. **Offline cache** (expo-sqlite).  
7. **Polish** (i18n Hindi, accessibility, notifications).  
8. **Ship** (APK build).

Use the **Windsurf Prompts** provided in each phase to generate code fast.

---

## 1) Project Goals & Non-Goals
**Goals**
- Free & open source app to discover **nearby local + luxury tailors** in India.
- Empower **poor/literate tailors** with digital presence.
- MVP: Auth → List/Map → Profile → Booking → Review → Admin verify.

**Non-Goals (MVP)**
- No online payments (UPI later).  
- No in-app chat (use **Call/WhatsApp deep link**).  
- No heavy analytics (later).

---

## 2) Baseline Tech & Tools
- **Expo (React Native)** — mobile app
- **TypeScript**
- **Supabase** — Postgres + Auth + Storage + RLS
- **OpenStreetMap** + **Nominatim** — free maps & geocoding
- **expo-sqlite** — offline cache
- **NativeWind** (Tailwind RN) or minimal StyleSheet
- **React Navigation** — routing
- **Zustand** or Context — app state
- **react-hook-form + zod** — forms & validation
- **expo-notifications** — push (optional MVP+)

---

## 3) System Architecture (High-Level)
```mermaid
flowchart LR
  A[Expo App (RN)] -->|supabase-js| B[(Supabase: Auth/DB/Storage)]
  A --> C[Edge Function: nominatim-proxy]
  C --> D[(Nominatim / OpenStreetMap)]
  A --> E[(SQLite Cache)]