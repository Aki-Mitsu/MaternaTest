# Materna Backend Implementation Checklist

This document tracks the backend architecture, database schema, API routes, and cloud persistence work required to make **Materna** 100% dynamic and functional (replacing static/demo mocks).

---

## Architecture Decisions
- **LLM Provider:** Google Gemini (`gemini-3.8-flash` via server-side API route `/api/ai`).
- **Authentication & Mode:** Demo mode removed. Supabase Auth (Google OAuth, Email/Password, Magic Link) is required, enforced via Next.js 16 [`proxy.ts`](../proxy.ts).
- **Source of Truth:** Supabase PostgreSQL with Row Level Security (`auth.uid() = user_id`), optimistic UI updates, and automatic rollback on failure.
- **Reminders & Notifications:** Driven by real-time feed/nap/hydration/mood logs with optional Browser Notification API alerts.

---

## P0: Core Functionality & Security (Completed)

- [x] **1. Real AI Sanctuary Companion (`/api/ai`)**
  - [x] Connect to Google Gemini (`gemini-3.8-flash`) with server-side `GEMINI_API_KEY`.
  - [x] Deterministic pre-LLM clinical red-flag & crisis escalation guardrails.
  - [x] Context validation (postpartum week, wake window, daily feeds/diapers/sleep, hydration, mood).
  - [x] Per-user rate limiting (15 requests/minute).
  - [x] Fix UTF-8 character encoding and format assistant responses (paragraphs, bullet lists, bold text) in [`AiAssistantModal.tsx`](../components/shared/AiAssistantModal.tsx).
- [x] **2. Server-Side Route Protection (`proxy.ts`)**
  - [x] Refresh Supabase auth session cookies on every request.
  - [x] Redirect unauthenticated users away from protected dashboard routes to `/login`.
  - [x] Redirect authenticated users away from `/login` to `/`.
- [x] **3. Server-Side Auth & Input Validation in API Routes**
  - [x] Require authenticated Supabase user (`401 Unauthorized` if missing) in `/api/ai` and `/api/user/stage`.
  - [x] Validate payload fields (`full_name`, `baby_name`, `baby_birth_date`, `primary_focus`) and return real database errors.
  - [x] Remove Demo Mode buttons/links from `/login` and `/profile`.
- [x] **4. Cloud Sync Engine & Onboarding Gate (`MaternaContext.tsx`)**
  - [x] Remove static "Sarah & Leo" seeded `localStorage` fallback that leaked across accounts.
  - [x] Optimistic state updates with rollback + toast error banner on database failure.
  - [x] Prevent `onAuthStateChange` token refreshes from clobbering in-flight edits.
  - [x] Gate dashboard behind `profile.onboarded` flag so new Google sign-ins complete `/onboarding` once.
  - [x] Fix Next.js 16 `cacheComponents` prerender compatibility (no `new Date()` during initial render and no dropped segments in `DashboardLayout`).

---

## P1: Missing Features & Full Data Persistence (Completed)

- [x] **5. Edit & Delete Support Across All Logs**
  - [x] Add `UPDATE` RLS policy for `baby_logs` and `DELETE` RLS policy for `maternal_mood_logs` (in [`20261108000000_sync_growth_onboarding.sql`](../supabase/migrations/20261108000000_sync_growth_onboarding.sql)).
  - [x] Add `updateBabyLog` (edit feed/diaper/sleep details) and `deleteMoodLog` in `MaternaContext` + UI controls in [`BabyQuickLogSummary.tsx`](../components/postpartum/BabyQuickLogSummary.tsx) and [`MaternalMoodReflection.tsx`](../components/postpartum/MaternalMoodReflection.tsx).
  - [x] Fetch and display multi-day `maternal_recovery_logs` history (`recoveryHistory`) in [`app/(dashboard)/recovery/page.tsx`](../app/(dashboard)/recovery/page.tsx).
- [x] **6. Infant Growth Measurements History & WHO Percentiles**
  - [x] Create `growth_measurements` table with RLS policies and `addGrowthMeasurement` / `deleteGrowthMeasurement` in `MaternaContext`.
  - [x] Display logged growth history timeline and calculate dynamic weight/length/head percentiles in [`NewbornGrowthMilestones.tsx`](../components/postpartum/NewbornGrowthMilestones.tsx).
- [x] **7. 52-Week Milestone Progress Persistence**
  - [x] Persist `completed_milestones` array on `profiles` in Supabase.
  - [x] Dynamically load milestones for the baby's current postpartum month from `BABY_52_WEEKS` in [`NewbornGrowthMilestones.tsx`](../components/postpartum/NewbornGrowthMilestones.tsx) and trigger confetti celebration on completion.
- [x] **8. Cross-Device Wake Window, Nap Target & Hydration Sync**
  - [x] Persist `last_wake_at` and `nap_target` on `profiles` in Supabase.
  - [x] Persist daily `water_glasses` and `completed_exercises` in `maternal_recovery_logs`.
- [x] **9. Serenity Audio Player Persistence**
  - [x] Persist `favorite_tracks` array on `profiles` in Supabase and default active track to the mother's favorite soundscape in [`SerenityAudioPlayer.tsx`](../components/postpartum/SerenityAudioPlayer.tsx).
- [x] **10. Profile Management, Data Export & Account Deletion**
  - [x] Server-side **Data Export API (`/api/user/export`)**: Download all profile, baby logs, mood logs, recovery logs, and growth measurements as `.json` or `.csv`.
  - [x] **Account Data Reset/Deletion API (`/api/user/delete`)**: Allow a mother to permanently delete all cloud health/baby logs and reset her onboarding profile from [`app/(dashboard)/profile/page.tsx`](../app/(dashboard)/profile/page.tsx).

---

## P2: Notifications, Hardening & Polish (Completed)

- [x] **11. Smart Reminders & Notifications System**
  - [x] Dynamic notifications popover in [`Navbar.tsx`](../components/shared/Navbar.tsx) with live unread badge count, 3-hour newborn feed interval countdown, wake-window nap countdown, quick `+1 Glass` hydration action, and daily mood check-in status.
  - [x] Browser Notification API integration (`Notification.requestPermission()`) to alert mothers when the baby's wake window is due.
- [x] **12. Privacy & Documentation Alignment**
  - [x] Document backend checklist in [`docs/BACKEND_CHECKLIST.md`](./BACKEND_CHECKLIST.md) and align [`README.md`](../README.md).
- [x] **13. Type Safety & Clean Linting**
  - [x] Align `types/database.ts` with all tables (`profiles`, `baby_logs`, `maternal_mood_logs`, `maternal_recovery_logs`, `growth_measurements`).
