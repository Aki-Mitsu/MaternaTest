# Materna 🌸

> **Fourth-Trimester Maternal Sanctuary & Newborn Tracker**  
> _"From Newborn to One"_ — Supporting maternal physical and emotional recovery alongside 52 weeks of infant developmental milestones.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 📖 Overview

Standard pregnancy apps often end at delivery—leaving new mothers facing the "postpartum cliff" where care abruptly pivots away from the mother right when sleep deprivation, hormonal adjustments, physical healing, and infant care intensify.

**Materna** is a mobile-first sanctuary built with low cognitive friction and warm, soothing aesthetics. Designed for one-handed use during late-night feeds, Materna unifies maternal recovery, mental well-being, and infant care across the critical first 52 weeks of life.

---

## ✨ Key Features

### 👶 1. "From Newborn to One" 52-Week Milestone Explorer

- **Dynamic Age Engine:** Automatically calculates postpartum age in weeks, days, and months from birth date.
- **Developmental Milestones:** 52-week curriculum with sensory, motor, and social cues.
- **WHO Growth percentiles:** Reference weight, length, and head circumference percentiles with an **Imperial (`lbs / in`)** and **Metric (`kg / cm`)** toggle.
- **Milestone Celebration:** Confetti animations to celebrate key developmental achievements.

### 🍼 2. One-Tap Baby Care Intelligence

- **Quick-Log Summary:** Track daily feeds, wet/dirty diapers, and sleep hours with single-tap controls.
- **Relative Timestamps:** Real-time "time ago" counters (e.g., _"Fed 25m ago"_) for quick status checks during foggy days and nights.
- **Activity Timeline:** Review and manage daily log history with instant deletion support.

### 😴 3. Smart Wake Window & Nap Predictor

- **Age-Appropriate Windows:** Dynamically scales recommended wake windows based on infant age (from 45-60m for newborns to 2-3h+ for older babies).
- **Nap Target Estimator:** Predicts next nap target time, tracks current nap count, and alerts mothers before overtiredness sets in.

### 🤍 4. Maternal Mood Reflections & Root-Cause Analytics

- **5-Point Mindfulness Check-in:** Simple one-tap reflection (_Depleted, Fragile, Balanced, Grounded, Joyful_).
- **Contextual Tagging:** Identify triggers across sleep, feeding, partner support, physical discomfort, and hormonal shifts.
- **7-Day Trend Visualizations:** Interactive mood donut chart, mindfulness score calculation, and sleep correlation graphs.

### 🧘‍♀️ 5. Maternal Recovery & Hydration Hub

- **Stage-Aware Healing:** Recovery checklists customized for immediate (Weeks 1–2), early (Weeks 3–6), and extended (Weeks 6+) postpartum healing.
- **Pelvic Floor & Core Care:** Safe guided breathwork and gentle rehabilitative exercises.
- **Hydration Tracker:** 8-glass daily water intake counter designed for nursing and healing mothers.

### 🎧 6. Serenity Audio Player

- **Ambient Soundscapes:** Soothing white noise, pink noise, womb sounds, and gentle lullabies to calm maternal nervous systems and settle restless babies.
- **Full Player Controls:** Scrubbing, 15-second skip/rewind, and favorite track toggling.

### 🤖 7. Sanctuary AI Companion

- **24/7 Empathetic Support:** Clinical-guardrailed, compassionate postpartum assistant answering questions regarding feeding, newborn sleep cues, and maternal healing.
- **Context-Aware:** Integrates current postpartum week and recent activity logs to deliver tailored, reassuring answers.

---

## 🛠️ Architecture & Tech Stack

| Layer               | Technology                                                                       |
| ------------------- | -------------------------------------------------------------------------------- |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)       |
| **UI Library**      | [React 19](https://react.dev/)                                                   |
| **Language**        | [TypeScript 5](https://www.typescriptlang.org/)                                  |
| **Styling**         | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables                      |
| **Icons**           | [Lucide React](https://lucide.dev/)                                              |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, SSR client)   |
| **AI Companion**    | [Google Gemini API](https://ai.google.dev/) (`gemini-3.8-flash` + clinical guardrails) |
| **Effects**         | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)                 |
| **Persistence**     | Supabase cloud persistence with Row Level Security (`auth.uid() = user_id`)      |

---

## 📁 Repository Structure

```text
Materna/
├── app/
│   ├── (auth)/
│   │   ├── login/               # Google OAuth, Email/Password & Magic Link auth
│   │   └── onboarding/          # 2-step setup: mother, baby, & priority focus
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Mobile frame wrapper + desktop navigation
│   │   ├── page.tsx             # Main Sanctuary dashboard
│   │   ├── mood/                # 7-day emotional analytics & tag trends
│   │   ├── recovery/            # Pelvic floor rehab & hydration hub
│   │   └── profile/             # Mother & baby profiles, settings, data export
│   ├── api/
│   │   ├── ai/                  # Gemini 3.8 Flash Sanctuary companion endpoint
│   │   └── user/
│   │       ├── stage/           # Validated user profile update endpoint
│   │       ├── export/          # Server-side CSV & JSON data export
│   │       └── delete/          # Cloud health logs & account reset endpoint
│   ├── globals.css              # Serenity color palette, organic radii, soft shadows
│   └── layout.tsx               # Root layout & font definitions
├── components/
│   ├── postpartum/
│   │   ├── BabyQuickLogSummary.tsx     # One-tap feed, diaper, and sleep logger
│   │   ├── MaternalMoodReflection.tsx  # Mood scoring, donut chart, tag cloud
│   │   ├── NewbornGrowthMilestones.tsx # 52-week milestone cards & growth charts
│   │   ├── NextNapPredictor.tsx        # Wake window timer & nap estimations
│   │   └── SerenityAudioPlayer.tsx     # Ambient audio soundscapes player
│   └── shared/
│       ├── AiAssistantModal.tsx        # AI companion dialog
│       ├── BottomNav.tsx               # Mobile-first floating bottom navigation
│       ├── HeroGreeting.tsx            # Stage banner & week milestone preview
│       └── Navbar.tsx                  # Top brand navigation & alerts
├── docs/                               # Detailed BRD, technical specs & audit
├── lib/
│   ├── context/
│   │   └── MaternaContext.tsx          # Local-first state engine with Supabase sync
│   ├── data/
│   │   └── babyMilestones52.ts         # Comprehensive 52-week infant milestones
│   ├── supabase/                       # Supabase browser & server clients
│   └── utils.ts                        # Postpartum age engine, time formatting
├── supabase/
│   ├── migrations/                     # PostgreSQL schema with RLS policies
│   └── seed.sql                        # Default demo seed data (Sarah & Leo)
└── types/
    └── database.ts                     # TypeScript definitions for Supabase schema
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- `npm`, `pnpm`, or `yarn`
- Optional: A free [Supabase](https://supabase.com/) account for cloud persistence

### 2. Clone the Repository

```bash
git clone https://github.com/ari5en/Materna.git
cd Materna
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase and Gemini credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.8-flash
```

### 5. Database Setup (Supabase)

Apply the database migrations in your Supabase project:

1. Navigate to your Supabase SQL Editor.
2. Run [`supabase/migrations/20261101000000_postpartum_schema.sql`](supabase/migrations/20261101000000_postpartum_schema.sql).
3. Run [`supabase/migrations/20261108000000_sync_growth_onboarding.sql`](supabase/migrations/20261108000000_sync_growth_onboarding.sql).
4. See [`docs/BACKEND_CHECKLIST.md`](docs/BACKEND_CHECKLIST.md) for the full backend architecture and checklist.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command         | Description                                            |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | Runs the Next.js development server with hot-reloading |
| `npm run build` | Builds the production bundle                           |
| `npm run start` | Starts the production server                           |
| `npm run lint`  | Runs ESLint checks                                     |

---

## 🔒 Security & Privacy

Postpartum health and infant logs are deeply private.

- **Row Level Security (RLS):** All Supabase database tables enforce strict user-level isolation (`auth.uid() = user_id`).
- **Encrypted Local Storage:** Standalone local mode stores health and infant logs on device.
- **Privacy-First AI:** Maternal assistant queries strip private identifiers before prompting.

---

## 🤝 Contributing

Contributions, feedback, and suggestions are warmly welcomed! Please read our [**Contributing Guide**](docs/CONTRIBUTING.md) for details on our branch conventions, Conventional Commits specification, code of conduct, and pull request workflow.

1. Fork the Project
6. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
7. Commit your Changes using Conventional Commits (`git commit -m 'feat: add amazing feature'`)
8. Push to the Branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request targeting `staging`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
