# **Materna: Fourth-Trimester Maternal Sanctuary & Newborn Tracker**

## **Business Requirements Document (BRD) & Implementation Specification**

**Target Timeline:** 1.5 Months (5–6 Weeks) — **Completed**  
**Platform:** Mobile-First Responsive Web Application (Optimized for mobile & desktop browsers)  
**Current Version:** `0.1.0` (Postpartum-Only Sanctuary Release)

---

## **Part 1: Business Requirements Document (BRD)**

### **1. Executive Summary & Product Vision**

**Materna** is a mobile-first web application designed specifically to support new mothers through the postpartum "Fourth Trimester" and the first year of infant development (*"From Newborn to One"*). Centered around maternal physical and emotional recovery, newborn care intelligence, and nervous system regulation, the application delivers one-tap newborn logging, dynamic wake-window predictions, interactive 52-week infant growth tracking, maternal pelvic floor and nutrition guidance, expressive mood reflections with root-cause analytics, ambient mindfulness audio, and a 24/7 clinical-guardrailed AI companion.

### **2. Target Audience & User Persona**

* **Primary Users:** New mothers navigating postpartum healing, lactation/feeding, sleep deprivation, and newborn care during the first 52 weeks after birth.
* **Default Demo Persona:** **Sarah** (Mother) & **Leo** (Baby, ~6 Weeks Postpartum / Month 2).
* **Key User Pain Points:**
  * Information overload and conflicting search results regarding newborn wake windows, feeding adequacy, and postpartum physical recovery.
  * The "postpartum cliff" where standard pregnancy apps stop supporting the mother once the baby is born.
  * Cognitive fatigue, fragmented sleep, and unaddressed maternal mental health shifts requiring an empathetic, low-friction, one-handed UI.

### **3. System Architecture & Lifecycle Flow**

* **Platform:** Mobile-First Responsive Web Application with a persistent mobile bottom navigation bar (`BottomNav`) and desktop top navigation (`Navbar`).
* **Authentication & Onboarding Flow:**
  1. **Instant Sanctuary Demo (`/login`):** One-tap *"Enter Sanctuary (Week 6 Demo)"* preloads Sarah & Leo's baseline profile, wake windows, nursing logs, and mood history, alongside email magic-link authentication.
  2. **2-Step Postpartum Onboarding (`/onboarding`):**
     * **Step 1 (Baseline Info):** Captures mother's name, baby's name/nickname, and baby's birth date.
     * **Step 2 (Sanctuary Focus):** Allows mothers to select priority areas (*Wake Windows & Sleep*, *Nursing & Milk Supply*, *Pelvic Floor & Healing*, *Emotional Wellness & Mood*, *Serenity & Mindfulness Audio*) and launches directly into **Postpartum Mode**.
* **Hybrid Local + Cloud Persistence (`MaternaContext`):**
  * **Zero-Latency Local State:** All profile updates, baby logs, and mood check-ins persist immediately to `localStorage` so tired mothers experience zero loading spinners or data loss offline.
  * **Supabase Cloud Sync:** When Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are configured, mutations automatically sync to PostgreSQL tables protected by Row Level Security (RLS).

---

### **4. Functional Requirements & Implemented Feature Scope**

#### **Module A: "From Newborn to One" 52-Week Growth & Milestone Explorer (`HeroGreeting`)**

1. **Dynamic Postpartum Age & Spotlight Card:** Automatically calculates the baby's postpartum age in weeks, days, and months from `baby_birth_date`. Displays the current week's developmental spotlight, playful fruit/object size comparison (e.g., *Week 6: Cantaloupe*), and parent tip.
2. **WHO Physical Metrics with Unit Toggle:** Displays weekly reference Length, Weight, and Head Circumference percentiles with a real-time **Imperial (`in / lbs`)** and **Metric (`cm / kg`)** toggle.
3. **Interactive 52-Week Timeline Explorer:** Supports switching between **Month View** (Months 1–12 horizontal pill strip showing 4 weekly cards per month) and **All 52 Weeks** grid view, complete with a **Milestone Celebration** confetti trigger (`canvas-confetti`).

#### **Module B: Baby Status, Quick-Log Summary & Smart Nap Predictor**

1. **Quick-Log Summary & 1-Tap Action Row (`BabyQuickLogSummary`):**
   * Displays live daily totals and time-since-last-entry cards for **Feeds**, **Diapers**, and **Sleep**.
   * **Quick 1-Tap Bar:** Instant single-tap buttons (`+ Nurse L`, `+ Nurse R`, `+ Wet Diaper`) with toast confirmation banners.
   * **Detailed Logging Modals:** Tapping any metric card opens a focused modal for **Feeds** (Left Breast, Right Breast with 15/20/25/30m duration, or Bottle with 60/90/120/150ml amount), **Diapers** (`Wet`, `Dirty`, `Mixed`), and **Sleep** (45m, 60m, 90m, 120m nap durations).
2. **Smart Next Nap Predictor (`NextNapPredictor`):**
   * Dynamically computes age-appropriate wake windows (e.g., `55m` for <4 weeks, `75m` for 4–8 weeks, `90m` for 8–12 weeks, `105m` for 12–16 weeks, `120m` for 16+ weeks).
   * Visualizes elapsed wake time on a gradient progress bar, displays countdown to next optimal nap, provides **Actionable Sleepy Cues** (gaze aversion, red eyebrows, yawning), and includes a **3 Naps / 4 Naps** daily target toggle.
3. **Newborn Growth & Developmental Checklist (`NewbornGrowthMilestones`):**
   * Summarizes WHO growth percentiles and provides an interactive checklist for key fourth-trimester milestones (*First Social Smile*, *Head Lifting / Tummy Time*, *Visual Tracking 180°*, *Coos & Vowel Sounds*).

#### **Module C: Maternal Recovery & Postpartum Nutrition Hub (`/recovery`)**

1. **Physical Recovery & Pelvic Floor Tab:**
   * **Bodily Recovery Status:** Tracks clinical fourth-trimester checkpoints (*Uterine Involution*, *Lochia Transition*, *Perineal / Incision Healing*).
   * **Gentle Daily Movement Checklist:** Interactive exercise tracker with completion counter for Stage 1 postpartum rehabilitation (*Diaphragmatic Ribcage Breathing*, *Gentle Pelvic Floor Lifts / Kegels*, *Supported Glute Bridges*, *Seated Cat-Cow Flow*).
2. **Nutrition & Lactation Support Tab:**
   * **Interactive Lactation Hydration Goal:** 10-glass interactive water tracker targeting 2.5–3.0 Liters daily.
   * **Curated Postpartum Food Guides:** Categorized recommendations for *Lactation & Milk Supply Boosters* (Oats & Chia, Brewer's Yeast & Flaxseed, Bone Broth & Collagen) and *Maternal Energy & Hormone Balancing* (Wild Caught Salmon, Avocado & Pumpkin Seeds, Slow-Cooked Lentil Stews).
   * **Direct AI Recovery Escalation Card:** One-tap prompt to ask the Materna AI companion about lochia changes, pelvic pressure, or galactagogues.

#### **Module D: Mom's Daily Reflection, Mood Analytics & Nervous System Regulation (`/mood`)**

1. **Mindfulness Heart & Mood Statistic Donut (`MaternalMoodReflection`):**
   * **3D Glowing Heart Card:** Visualizes mindfulness consistency and positive trend progression.
   * **Segmented Mood Donut Chart:** Breaks down emotional distribution across *Happy (65%)*, *Calm (15%)*, and *Fragile (20%)*.
2. **5-Point Expressive Mood Scale & Context Tagging:**
   * **Visual Scale:** `1: Depleted (🥀)`, `2: Fragile (🌸)`, `3: Balanced (🌊)`, `4: Grounded (🪷)`, `5: Joyful (✨)`.
   * **Postpartum Context Tags:** Tappable multi-select root-cause pills (*Baby's Feeding*, *Sleep Deprivation*, *Physical Healing*, *Hormonal Shift*, *Partner Support*, *Grateful*, *Overwhelmed*, *Quiet Time*) plus optional free-text reflection notes.
3. **7-Day Mood Trajectory & Root-Cause Breakdown (`/mood`):**
   * Bar chart visualizing the 7-day emotional trajectory alongside automated sleep-correlation insights and tag frequency progress bars.
4. **1-Minute Vagus Nerve Box Reset (`/mood`):**
   * Interactive guided breathing timer cycling through **Inhale**, **Hold**, and **Exhale** (4-second intervals) with animated visual scaling to calm the maternal startle response.

#### **Module E: Serenity Rhythms Audio Player (`SerenityAudioPlayer`)**

1. **Built-In Soundscape Player:** Features a blooming lotus centerpiece, interactive play/pause, 15-second skip controls, progress scrubber, and favorite toggle.
2. **Curated Postpartum & Newborn Tracks:** Includes 5 specialized tracks (*Harmonious Wind — Womb White Noise*, *Silent Streams — Gentle Relaxation*, *Celestial Calm — Newborn Sleep*, *Piano Instrument — Maternal Peace*, and *Peaceful Rain — Deep Rest*).

#### **Module F: Universal Sanctuary AI Companion & Crisis Safety Net**

1. **Global Accessibility (`FloatingAiButton` & `AiAssistantModal`):** Accessible from any screen via the floating AI button, navbar button, or recovery hub prompt.
2. **Clinical Red-Flag Guardrails (`/api/ai/route.ts` & `AiAssistantModal`):**
   * Detects acute maternal warning signs (heavy bleeding/soaking pads, blood clots, fever > 100.4°F, severe headache/vision changes, calf pain, or severe emotional distress) and immediately surfaces urgent OB/GYN triage warnings.
   * Displays a persistent medical disclaimer banner and quick-tap suggested prompts for 3-AM questions.
3. **Maternal Crisis & Postpartum Hotlines (`/profile`):**
   * Dedicated 24/7 crisis directory in the Mother Sanctuary Profile featuring the **National Maternal Mental Health Hotline (`1-833-943-5746`)** and **Postpartum Support International (`1-800-944-4773`)**.

---

### **5. Technical Requirements, Stack & Design System**

| Layer / Domain | Technology Choice | Purpose |
| :---- | :---- | :---- |
| **Framework & Routing** | Next.js `16.4.1` (App Router) + React `19.3.0` + TypeScript `5` | Fast client/server rendering, route groups for `(auth)` and `(dashboard)`, and strict type safety. |
| **UI, Styling & Icons** | Tailwind CSS v4 (`@tailwindcss/turbopack`) + `lucide-react` + `canvas-confetti` | Custom **Serene Mindfulness Palette** with glassmorphism, custom lotus iconography (`LotusIcon`), and milestone celebrations. |
| **Typography** | `Playfair Display` (Serif) + `Plus Jakarta Sans` (Sans-Serif) | Editorial warmth for headings paired with high-legibility geometric sans-serif for metrics and logs. |
| **State & Database** | `MaternaContext` (`localStorage`) + Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | Instant offline-resilient client state with automatic cloud synchronization to PostgreSQL + RLS. |
| **AI Companion Layer** | Next.js Route Handler (`/api/ai`) + `AiAssistantModal` | Context-aware fourth-trimester guidance with deterministic clinical red-flag escalation. |

#### **Serene Mindfulness Color Palette (`app/globals.css`)**

* **Canvas Background:** `#F8F3F7` (Soft Lavender-Cream) & `#FBF9F5` (Warm Sanctuary Frame)
* **Primary Brand / Plum:** `#69486F` (Plum Primary) & `#4C3053` (Deep Plum)
* **Interactive Accent / Berry Rose:** `#9E4875` / `#A14A76`
* **Soft Gradients & Cards:** `#FFE8DE` (Peach Glow), `#FCE4EF` (Rose Mist), `#EDE3F7` (Lavender Soft)

### **6. Non-Functional Requirements**

* **Zero-Latency Interaction:** All logging actions (feeds, diapers, sleep, mood, hydration, exercises) update the UI instantaneously via optimistic state and `localStorage` persistence.
* **Hydration & SSR Stability:** Deterministic date anchoring (`STATIC_STABLE_ANCHOR` in `lib/utils.ts`) prevents React hydration mismatches between server renders and client timezones.
* **Accessibility & Ergonomics:** Large rounded pill controls (`min-h-[44px]`), one-tap quick-log buttons for single-handed operation during nursing, and clear visual hierarchy.
* **Data Privacy & Safety:** Row Level Security (RLS) policies on all Supabase tables (`profiles`, `baby_logs`, `maternal_mood_logs`) plus prominent medical disclaimers.

---

## **Part 2: Project Directory Structure & Implementation Details**

### **1. Actual Project Directory Structure**

```text
materna/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Week 6 instant demo login & magic link sign-in
│   │   └── onboarding/page.tsx          # 2-step onboarding (baseline info + sanctuary focus)
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Shared MobileFrame, Navbar, BottomNav, FloatingAiButton & Modal
│   │   ├── page.tsx                     # Main dashboard (Hero 52-Wk Guide, Quick-Logs, Nap Predictor, Mood, Audio)
│   │   ├── recovery/page.tsx            # Maternal Recovery Hub (Pelvic floor exercises, hydration & lactation nutrition)
│   │   ├── mood/page.tsx                # Maternal Mental Wellness (Mood check-in, 7-day bar chart, Vagus nerve breath)
│   │   └── profile/page.tsx             # Sanctuary Profile editor, journey status & 24/7 crisis hotlines
│   ├── api/
│   │   ├── ai/route.ts                  # Postpartum AI companion endpoint with red-flag safety guardrails
│   │   └── user/stage/route.ts          # Server endpoint for upserting user profile data to Supabase
│   ├── globals.css                      # Tailwind v4 imports & Serene Mindfulness CSS variables
│   └── layout.tsx                       # Root layout with Playfair Display + Plus Jakarta Sans fonts & MaternaProvider
├── components/
│   ├── postpartum/
│   │   ├── BabyQuickLogSummary.tsx      # 3 metric cards, 1-tap quick log bar & feed/diaper/sleep modals
│   │   ├── MaternalMoodReflection.tsx   # 3D Mindfulness Heart, Mood Donut chart, 5-point scale & context tags
│   │   ├── NewbornGrowthMilestones.tsx  # WHO growth percentiles & interactive newborn milestone checklist
│   │   ├── NextNapPredictor.tsx         # Dynamic wake-window countdown, progress bar, sleepy cues & nap target
│   │   └── SerenityAudioPlayer.tsx      # Blooming lotus audio player with 5 postpartum/newborn soundscapes
│   └── shared/
│       ├── AiAssistantModal.tsx         # Interactive 24/7 AI chat modal with suggested prompts & disclaimers
│       ├── BottomNav.tsx                # Mobile floating pill navigation (Today, Recovery, Mood, Profile)
│       ├── FloatingAiButton.tsx         # Persistent floating action button to open Materna AI
│       ├── HeroGreeting.tsx             # "From Newborn to One" 52-week interactive size & milestone explorer
│       ├── LotusIcon.tsx                # Custom SVG lotus brand emblem
│       ├── MobileFrame.tsx              # Responsive max-w-6xl container shell
│       └── Navbar.tsx                   # Sticky header with mother avatar, desktop nav pills & Ask AI button
├── docs/
│   └── Materna_BRD_and _Implementation.md
├── lib/
│   ├── context/
│   │   └── MaternaContext.tsx           # Global React Context with localStorage + Supabase dual persistence
│   ├── data/
│   │   └── babyMilestones52.ts          # Complete 52-week dataset (sizes, imperial/metric measurements, tips)
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client & configuration detector
│   │   └── server.ts                    # SSR cookie-based Supabase server client
│   └── utils.ts                         # cn() helper, date formatter & calculatePostpartumAge() engine
├── public/
│   └── images/
│       └── baby_cooing_week6.jpg        # Featured Week 6 newborn milestone illustration
├── supabase/
│   ├── migrations/
│   │   └── 20261101000000_postpartum_schema.sql # PostgreSQL tables, RLS policies & indexes
│   └── seed.sql                         # Default demo profile (Sarah & Leo) and initial logs
└── types/
    └── database.ts                      # TypeScript interfaces for Profile, BabyLog, MaternalMoodLog & Database
```

---

### **2. Database Schema (Supabase / PostgreSQL)**

Defined in `supabase/migrations/20261101000000_postpartum_schema.sql` with Row Level Security (RLS) enabled across all tables:

1. **`profiles`**
   * `id` (`UUID`, Primary Key, references `auth.users(id) ON DELETE CASCADE`)
   * `full_name` (`TEXT`, non-nullable, default `'Sarah'`)
   * `baby_name` (`TEXT`, default `'Leo'`)
   * `baby_birth_date` (`DATE`, non-nullable, default `CURRENT_DATE`)
   * `created_at` (`TIMESTAMPTZ`, default `NOW()`)
   * `updated_at` (`TIMESTAMPTZ`, default `NOW()`)
2. **`baby_logs`**
   * `id` (`UUID`, Primary Key, default `gen_random_uuid()`)
   * `user_id` (`UUID`, Foreign Key to `profiles(id) ON DELETE CASCADE`)
   * `log_type` (`TEXT`, check constraint: `'feed' | 'diaper' | 'sleep'`)
   * `details` (`JSONB`, stores `{ side, duration_mins, amount_ml, bottle_type, type, notes }`)
   * `timestamp` (`TIMESTAMPTZ`, default `NOW()`)
   * *Index:* `idx_baby_logs_user_timestamp ON baby_logs(user_id, timestamp DESC)`
3. **`maternal_mood_logs`**
   * `id` (`UUID`, Primary Key, default `gen_random_uuid()`)
   * `user_id` (`UUID`, Foreign Key to `profiles(id) ON DELETE CASCADE`)
   * `score` (`INTEGER`, check constraint: `score BETWEEN 1 AND 5`)
   * `tags` (`TEXT[]`, array of postpartum contextual tags)
   * `notes` (`TEXT`, optional reflection note)
   * `logged_date` (`DATE`, default `CURRENT_DATE`)
   * `created_at` (`TIMESTAMPTZ`, default `NOW()`)
   * *Index:* `idx_maternal_mood_user_date ON maternal_mood_logs(user_id, logged_date DESC)`

---

### **3. Feature-by-Feature Development Checkpoint Roadmap (5 Weeks — Completed)**

#### **Week 1: Project Setup, Architecture & Database**

* **Focus:** Foundation, state architecture, authentication views, and database schema.
* **Checklist / Deliverables:**
  * [x] Initialize Next.js 16 (App Router) repository with React 19, TypeScript, and Tailwind CSS v4.
  * [x] Create Supabase migration (`20261101000000_postpartum_schema.sql`), RLS policies, and seed data (`seed.sql`).
  * [x] Build `MaternaContext` with hybrid `localStorage` + Supabase persistence and Week 6 demo defaults.
  * [x] Build the 2-step **Onboarding Flow** (`/onboarding`) and **Login / Demo Entry** (`/login`).
  * [x] Implement responsive layout shell (`MobileFrame`, `Navbar`, `BottomNav`) with the Serene Mindfulness palette.
* **Checkpoint Gate:** Passed — Users can sign in via instant Week 6 Demo or complete the 2-step onboarding flow and navigate all core routes.

#### **Week 2: Postpartum Baby Tracking, 52-Week Guide & Smart Nap Predictor**

* **Focus:** Newborn tracking, 52-week developmental explorer, and wake-window intelligence.
* **Checklist / Deliverables:**
  * [x] Build **"From Newborn to One" (`HeroGreeting`)** with the complete 52-week dataset (`babyMilestones52.ts`), Imperial/Metric unit toggle, Month/All-Weeks view switcher, and celebration confetti.
  * [x] Build **Baby Quick-Log Summary (`BabyQuickLogSummary`)** with 1-tap quick buttons and detailed feed, diaper, and sleep modals.
  * [x] Build **Smart Next Nap Predictor (`NextNapPredictor`)** using `calculatePostpartumAge` wake-window logic, sleepy cues, and 3/4 nap target selector.
  * [x] Build **Newborn Growth & Milestones Checklist (`NewbornGrowthMilestones`)** with WHO percentile summary cards.
* **Checkpoint Gate:** Passed — Mothers can log feeds, diapers, and sleep in one tap, explore all 52 weeks of baby development, and view dynamic wake-window predictions.

#### **Week 3: Maternal Recovery, Pelvic Floor & Postpartum Nutrition Hub**

* **Focus:** Mother's physical healing, pelvic floor rehabilitation, and lactation nutrition.
* **Checklist / Deliverables:**
  * [x] Build the **Maternal Recovery Hub (`/recovery`)** with Physical & Pelvic Floor and Nutrition & Lactation tabs.
  * [x] Implement bodily recovery status checkpoints and interactive **Gentle Daily Movement** exercise checklist.
  * [x] Build interactive 10-glass **Lactation Hydration Goal** tracker and curated galactagogue/energy food cards.
* **Checkpoint Gate:** Passed — The recovery hub tracks daily pelvic floor exercises, hydration glasses, and stage-specific healing milestones.

#### **Week 4: Mood Reflections, Sentiment Trends, Vagus Nerve Breathing & Serenity Audio**

* **Focus:** Maternal mental health, root-cause analytics, nervous system regulation, and ambient audio.
* **Checklist / Deliverables:**
  * [x] Build **Maternal Mood Reflection (`MaternalMoodReflection`)** featuring the 3D Glowing Heart card, Mood Statistic Donut chart, 5-point floral mood scale, context tags, and journal notes.
  * [x] Build the dedicated **Mood Analytics Page (`/mood`)** with a 7-Day Mood Trajectory bar chart, root-cause tag frequency bars, and the interactive **1-Minute Vagus Nerve Box Reset** breathing guide.
  * [x] Build the **Serenity Rhythms Audio Player (`SerenityAudioPlayer`)** with 5 curated tracks and playback controls.
* **Checkpoint Gate:** Passed — Mothers can log daily mood reflections, review 7-day emotional trends, practice guided box breathing, and play calming soundscapes.

#### **Week 5: Sanctuary AI Companion, Crisis Resources & Polish**

* **Focus:** Conversational AI safety net, crisis support directory, and responsive polish.
* **Checklist / Deliverables:**
  * [x] Build `FloatingAiButton`, `AiAssistantModal`, and `/api/ai` route with postpartum clinical red-flag escalation triggers and medical disclaimers.
  * [x] Build the **Mother Sanctuary Profile (`/profile`)** with profile editing, demo reset, fourth-trimester journey metrics, and 24/7 Maternal Crisis & Postpartum Hotlines.
  * [x] Verify SSR hydration safety, mobile touch targets, and desktop multi-column responsiveness.
* **Checkpoint Gate:** Passed — Full application verified across mobile and desktop viewports with zero hydration errors.
