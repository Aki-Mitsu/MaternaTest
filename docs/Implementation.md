# **Materna: Dynamic Feature Implementation Plan**

This document audits all currently **static, simulated, or local-only** features across the **Materna** codebase and defines the technical implementation plan to make every module fully dynamic, data-driven, and persisted in **Supabase**.

---

## **1. Audit Summary: Static vs. Dynamic Status**

| Module / Component | Current State | What Needs to Become Dynamic |
| :---- | :---- | :---- |
| **Postpartum Age Engine** (`lib/utils.ts`) | Uses a static anchor date (`2026-10-24`) by default | Compute real-time age against `new Date()` so any baby birth date reflects true live weeks & days. |
| **Baby Quick-Log Summary** (`BabyQuickLogSummary.tsx`) | Hardcoded fallback counts (`6` feeds, `5` diapers, `5.2h` sleep) and static `"12m ago"` / `"45m ago"` labels | Compute real daily totals (starting at `0`), real relative timestamps (`formatTimeAgo`), plus a live log history drawer with delete support. |
| **Next Nap Predictor** (`NextNapPredictor.tsx`) | Hardcoded `minutesSinceWake = 45`, static `"Approx. 11:30 AM • Nap #2"`, and unpersisted nap target | Calculate live elapsed wake time from the latest `sleep` log (or a live "Wake Up / Start Nap" timer), real predicted clock time, and actual nap count today. |
| **Newborn Growth & Milestones** (`NewbornGrowthMilestones.tsx`) | Hardcoded WHO stats (`11.4 lbs`, `22.8 in`, `15.4 in`) and ephemeral `useState` checklist | Persist completed milestones & custom baby measurements (weight, length, head circ.) to Supabase; dynamically filter milestones by current postpartum week. |
| **Mood Reflection & Donut Chart** (`MaternalMoodReflection.tsx`) | Hardcoded `88%` heart score, `123` count, and fixed `65% / 15% / 20%` SVG donut arcs | Compute mindfulness score, week-over-week delta, total check-ins, and Happy/Calm/Fragile donut percentages & SVG `strokeDasharray` from `moodLogs`. |
| **7-Day Mood & Root-Cause Analytics** (`app/(dashboard)/mood/page.tsx`) | Hardcoded `weekTrend` (Mon–Sun) and `tagStats` arrays; ignores `moodLogs` from context | Aggregate the last 7 days of `maternal_mood_logs` for the bar chart, compute real average score, correlate with daily sleep hours, and rank real tag frequencies. |
| **Maternal Recovery & Hydration Hub** (`app/(dashboard)/recovery/page.tsx`) | `waterGlasses` and `completedExercises` reset on page refresh; static Week 6 recovery cards | Persist daily hydration count and completed exercises in Supabase (`maternal_recovery_logs` table); adapt bodily recovery checkpoints to the mother's actual postpartum week. |
| **Serenity Audio Player** (`SerenityAudioPlayer.tsx`) | Simulated UI toggle (no real audio playback; progress bar jumps between `28%` and `64%`) | Implement real Web Audio API / HTML5 `<audio>` ambient sound generation & playback, live time scrubber, `-15s / +15s` seek, and persisted favorite tracks. |
| **Sanctuary AI Companion** (`AiAssistantModal.tsx`, `app/api/ai/route.ts`) | Modal uses client-side `setTimeout` with 4 hardcoded keyword replies; never calls `/api/ai` | Connect `AiAssistantModal` to `/api/ai`, integrate LLM API (Gemini / OpenAI) with live maternal & baby context (age, recent logs, mood), and persist chat history. |
| **Onboarding Focus & Notifications** (`onboarding/page.tsx`, `Navbar.tsx`) | Step 2 `primaryFocus` selection is discarded on submit; Navbar bell icon has no handler | Save `primary_focus` array to `profiles` table to customize dashboard highlights; add interactive notifications popover for nap/hydration/mood reminders. |

---

## **2. Detailed Feature-by-Feature Implementation Specs**

### **Phase 1: Core Time Engine & Baby Tracking Intelligence**

#### **1.1 Real-Time Postpartum Age Calculation**
* **File:** [`lib/utils.ts`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/lib/utils.ts)
* **Current Issue:** `calculatePostpartumAge()` defaults to `STATIC_STABLE_ANCHOR` (`2026-10-24`), causing newly created accounts with recent baby birth dates to miscalculate weeks/days.
* **Implementation:**
  * Use `new Date()` on the client (or pass current date after hydration) so `weeks`, `days`, `totalDays`, `recoveryStage`, and `recommendedWakeWindowMins` reflect real wall-clock time.
  * Add a `formatTimeAgo(isoTimestamp: string)` helper that returns `"Just now"`, `"14m ago"`, `"2h 10m ago"`, etc., and refreshes every 60 seconds.

#### **1.2 Dynamic Baby Quick-Log Summary & Log History**
* **File:** [`components/postpartum/BabyQuickLogSummary.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/postpartum/BabyQuickLogSummary.tsx)
* **Current Issues:**
  * Lines 34–36 use `|| 6`, `|| 5`, `|| 5.2` fallbacks, so an empty day still displays 6 feeds, 5 diapers, and 5.2h sleep.
  * Lines 121, 148, and 177 hardcode `"12m ago"`, `"45m ago"`, and `"Awake 45m"`.
  * Logged items cannot be viewed in a list or deleted.
* **Implementation:**
  * Remove the `|| 6`, `|| 5`, `|| 5.2` fallbacks so true counts (`0`, `1`, `2`...) are shown from `todayLogs`.
  * Compute relative time since `lastFeed?.timestamp`, `lastDiaper?.timestamp`, and `lastSleep?.timestamp` using `formatTimeAgo()` (showing `"No logs today"` when empty).
  * Add a **"Today's Activity Timeline"** collapsible list below the quick-log bar showing today's individual feed/diaper/sleep entries with a delete button (`deleteBabyLog(id)` in `MaternaContext` + Supabase `DELETE`).

#### **1.3 Live Next Nap Predictor & Wake Window Timer**
* **File:** [`components/postpartum/NextNapPredictor.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/postpartum/NextNapPredictor.tsx)
* **Current Issues:**
  * `minutesSinceWake = 45` is hardcoded on line 15.
  * `"Approx. 11:30 AM • Nap #2"` and `"Woke 45m ago"` are static strings.
* **Implementation:**
  * Derive `lastWakeTimestamp` from the most recent `sleep` log in `babyLogs` (or allow a 1-tap **"Baby Woke Up Now"** / **"Start Nap Timer"** button).
  * Calculate `minutesSinceWake = Math.floor((Date.now() - lastWakeTime) / 60000)` using a 30-second interval timer.
  * Calculate the exact predicted nap clock time (`new Date(lastWakeTime + wakeWindowMins * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })`).
  * Compute `currentNapNumber = todaySleepLogs.length + 1` (e.g., `Nap #3 of 4`).
  * Persist the user's selected `napTarget` (`3` or `4` naps) in `profiles` or `localStorage`.

#### **1.4 Dynamic Newborn Growth & Milestones Tracker**
* **Files:** [`components/postpartum/NewbornGrowthMilestones.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/postpartum/NewbornGrowthMilestones.tsx), [`components/shared/HeroGreeting.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/shared/HeroGreeting.tsx)
* **Current Issues:**
  * `11.4 lbs`, `22.8 in`, and `15.4 in` are static strings in `NewbornGrowthMilestones.tsx`.
  * `completedMilestones` resets on page reload.
* **Implementation:**
  * Pull baseline reference metrics for the baby's current week from `BABY_52_WEEKS` or allow mothers to log custom pediatric checkup measurements (`weight_lbs`, `length_in`, `head_circ_in`) saved to `profiles`.
  * Persist `completed_milestones` (`TEXT[]`) in `profiles` so checked-off milestones sync across devices.

---

### **Phase 2: Dynamic Mood Analytics & Nervous System Regulation**

#### **2.1 Real-Time Mood Donut & Mindfulness Heart Metrics**
* **File:** [`components/postpartum/MaternalMoodReflection.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/postpartum/MaternalMoodReflection.tsx)
* **Current Issues:**
  * Heart card displays static `88%` and `Statistics up 15%`.
  * Donut chart displays static `123` check-ins and hardcoded `65% Happy / 15% Calm / 20% Fragile` SVG arcs.
* **Implementation:**
  * Compute from `moodLogs`:
    * **Happy %:** `score >= 4` (*Grounded* & *Joyful*)
    * **Calm %:** `score === 3` (*Balanced*)
    * **Fragile %:** `score <= 2` (*Depleted* & *Fragile*)
  * Dynamically calculate SVG `strokeDasharray` and `strokeDashoffset` from the real percentages (circumference $2 \pi r \approx 238.76$).
  * Display total `moodLogs.length` in the center of the donut and compute the real wellness percentage `(averageScore / 5) * 100` inside the 3D Glowing Heart.
  * When clicking **"Learn more" / "Add Reflection Note"**, display recent journal notes below the check-in card.

#### **2.2 Live 7-Day Mood Trajectory & Root-Cause Tag Aggregation**
* **File:** [`app/(dashboard)/mood/page.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/app/(dashboard)/mood/page.tsx)
* **Current Issues:**
  * `weekTrend` (lines 35–43) and `tagStats` (lines 45–52) are hardcoded arrays.
  * The sleep-correlation callout banner (line 119) is static text.
* **Implementation:**
  * Generate the last 7 calendar days dynamically (`Mon`, `Tue`, etc.) and map each day to the user's logged `score` in `moodLogs`.
  * Compute the real 7-day average score (e.g., `3.8 / 5.0`) and dynamic status badge (*Healthy Equilibrium*, *Gentle Care Needed*, *Thriving*).
  * Aggregate all `tags` across `moodLogs` to compute exact counts and percentages for the **Root Cause & Contextual Tagging** progress bars.
  * Generate a dynamic insight banner based on the highest-frequency tag and lowest-scoring day.

---

### **Phase 3: Maternal Recovery & Hydration Persistence**

#### **3.1 Persistent Daily Hydration, Exercise Checklist & Stage-Aware Recovery**
* **File:** [`app/(dashboard)/recovery/page.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/app/(dashboard)/recovery/page.tsx)
* **Current Issues:**
  * `waterGlasses` (`useState(6)`) and `completedExercises` (`useState(['ex-1'])`) are lost when navigating away or refreshing.
  * `recoveryMilestones` always show Week 6 statuses even if `postData.weeks` is Week 2 or Week 14.
* **Implementation:**
  * Add a `maternal_recovery_logs` table (or store daily recovery state in `MaternaContext` + Supabase) keyed by `(user_id, logged_date)` storing:
    * `water_glasses` (`INTEGER`, 0–10)
    * `completed_exercises` (`TEXT[]`)
  * Make `recoveryMilestones` dynamic based on `postData.weeks` (e.g., Weeks 1–2: *Lochia Rubra / Early Involution*, Weeks 3–5: *Lochia Serosa / Pelvic Rest*, Weeks 6+: *Uterine Involution Complete / Lochia Alba*).

---

### **Phase 4: Real Web Audio Synthesis & Playback (`SerenityAudioPlayer`)**

#### **4.1 Functional Soundscape Audio Engine**
* **File:** [`components/postpartum/SerenityAudioPlayer.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/postpartum/SerenityAudioPlayer.tsx)
* **Current Issues:**
  * Clicking Play/Pause only toggles a CSS width (`w-[28%]` vs `w-[64%]`) and static time label (`0:35` vs `1:24`) with no sound.
  * Rewind (`-15s`) and Fast-Forward (`+15s`) buttons have no `onClick` handlers.
* **Implementation:**
  * Build a zero-dependency **Web Audio API Synthesizer / Ambient Soundscape Generator** (generating soothing pink/brown womb noise, gentle rain filtering, soft stream binaural waves, and ambient harmonic chords) or connect real audio streams so every track plays real, soothing audio in the browser.
  * Implement a real `currentTime` and `duration` timer with interactive progress bar scrubbing, functional `-15s` / `+15s` seek buttons, and per-track favorite persistence.

---

### **Phase 5: Live Context-Aware AI Companion**

#### **5.1 Connect `AiAssistantModal` to `/api/ai` with Real User Context**
* **Files:** [`components/shared/AiAssistantModal.tsx`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/components/shared/AiAssistantModal.tsx), [`app/api/ai/route.ts`](file:///c:/Users/Claire%20Nicole%20Bay/OneDrive/Desktop/Originae/app/api/ai/route.ts)
* **Current Issues:**
  * `AiAssistantModal.tsx` uses a local `setTimeout` instead of calling `/api/ai`.
  * Responses do not incorporate the user's actual baby logs, mood score, or postpartum week.
* **Implementation:**
  * Wire `AiAssistantModal.tsx` to `POST /api/ai` passing `{ messages, context: { profile, postpartumWeeks, todayFeedsCount, todayDiapersCount, todaySleepHours, latestMood } }`.
  * Upgrade `/api/ai/route.ts` to support live LLM generation (via Gemini / OpenAI API key if configured, with an expanded, context-aware clinical fallback engine that references the mother's actual name, baby's name, current week, and today's logged metrics).
  * Persist chat message history in `MaternaContext` so closing and reopening the modal preserves the conversation.

---

### **Phase 6: Database Schema Additions (`supabase/migrations/`)**

To support full persistence of all dynamic features above, apply the following schema expansion in Supabase SQL Editor:

```sql
-- 1. Add growth metrics, focus preferences & milestones to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_focus TEXT[] DEFAULT ARRAY['Wake Windows & Sleep', 'Nursing & Milk Supply']::TEXT[],
  ADD COLUMN IF NOT EXISTS completed_milestones TEXT[] DEFAULT ARRAY['m-1', 'm-2']::TEXT[],
  ADD COLUMN IF NOT EXISTS nap_target INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS baby_weight_lbs NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS baby_length_in NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS baby_head_in NUMERIC(4,1);

-- 2. Create Daily Maternal Recovery & Hydration Table
CREATE TABLE IF NOT EXISTS public.maternal_recovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_glasses INTEGER NOT NULL DEFAULT 0 CHECK (water_glasses BETWEEN 0 AND 15),
  completed_exercises TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, logged_date)
);

ALTER TABLE public.maternal_recovery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own recovery logs" ON public.maternal_recovery_logs;
CREATE POLICY "Users can manage their own recovery logs"
  ON public.maternal_recovery_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## **3. Execution Checklist**

- [x] **Step 1 (Database & Context):** Run the schema expansion migration and add `deleteBabyLog`, `recoveryLog` (hydration + exercises), `completedMilestones`, and `primaryFocus` state + Supabase sync to `MaternaContext.tsx`.
- [x] **Step 2 (Baby Status & Nap Intelligence):** Make `BabyQuickLogSummary.tsx`, `NextNapPredictor.tsx`, and `NewbornGrowthMilestones.tsx` 100% driven by real timestamps and user logs.
- [x] **Step 3 (Mood Analytics & Donut Chart):** Make `MaternalMoodReflection.tsx` and `app/(dashboard)/mood/page.tsx` dynamically calculate all percentages, 7-day bars, and tag rankings from `moodLogs`.
- [x] **Step 4 (Recovery Hub & Onboarding):** Connect `app/(dashboard)/recovery/page.tsx` and `app/(auth)/onboarding/page.tsx` to persist hydration, exercise completions, and focus preferences to Supabase.
- [x] **Step 5 (Audio Player & AI Companion):** Add real Web Audio soundscape synthesis to `SerenityAudioPlayer.tsx` and connect `AiAssistantModal.tsx` to `/api/ai` with live maternal/baby context.

