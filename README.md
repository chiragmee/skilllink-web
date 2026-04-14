# SkillLink

A platform to discover, book, and learn from verified local experts across skills like Music, Fitness, Academics, Sports, and more.

Learners browse expert profiles, pick a time slot, and pay — experts manage bookings and track earnings through a dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | Supabase (Google OAuth) + custom JWT exchange |
| Backend API | Node.js, Express, Prisma ORM |
| Database | PostgreSQL (via Supabase) |
| Payments | Razorpay |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Features

**For Learners**
- Browse and search experts by skill, category, mode (online/offline), and price
- View expert profiles with reviews, pricing, and availability
- Book a session by picking a date and time slot
- Pay online via Razorpay or request offline payment
- Track upcoming and past bookings
- Cancel bookings and leave reviews after sessions

**For Experts**
- Register as an expert with bio, city, skills, pricing, and availability
- Accept or reject booking requests
- Mark sessions as complete
- View earnings and upcoming sessions on a dashboard

**Auth**
- Google Sign-In via Supabase OAuth
- JWT-based session with the backend
- Persistent login via localStorage

---

## Project Structure

```
app/
  page.tsx              # Home — expert discovery + search
  login/                # Google sign-in
  auth/callback/        # OAuth callback handler
  expert/[id]/          # Expert profile + booking flow
  booking/confirm/      # Checkout + Razorpay payment
  bookings/             # Learner's booking history
  dashboard/            # Expert dashboard
  register-expert/      # Expert onboarding (3-step)
  profile/              # User profile + sign out

components/
  TopBar.tsx            # Sticky header with user menu + logout
  BottomNav.tsx         # Mobile bottom navigation
  Toast.tsx             # Notification toasts

lib/
  api.ts                # Typed API client (all backend calls)
  auth-context.tsx      # Auth state provider (user, signIn, signOut, refreshUser)
  supabase.ts           # Supabase client
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with Google OAuth enabled
- A [Razorpay](https://razorpay.com) test account
- The [SkillLink API](https://github.com/chiragmee/skilllink-api) running locally or deployed

### 1. Clone the repo

```bash
git clone https://github.com/chiragmee/skilllink-web.git
cd skilllink-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required variables.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

All required variables are listed in `.env.example`. Never commit `.env.local`.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `NEXT_PUBLIC_API_URL` | Your deployed backend URL (e.g. Render) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → API Keys → Key ID |

---

## Backend

The API is a separate repository: [skilllink-api](https://github.com/chiragmee/skilllink-api)

Built with Express + Prisma + PostgreSQL. Handles auth, experts, bookings, payments, and reviews.

---

## Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com). Connect the repo and add the environment variables in project settings.
- **Backend**: Deployed on [Render](https://render.com). Set `ALLOWED_ORIGINS` to your Vercel URL to enable CORS.

---

## Key Design Decisions

- **Supabase for auth, custom JWT for API** — Google OAuth is handled by Supabase; the frontend exchanges the Supabase token for a backend-issued JWT used for all API calls.
- **Slot-based availability** — Experts define recurring weekly availability; learners pick from generated slots. A distributed lock prevents double-booking.
- **Razorpay integration** — Payment is initiated server-side (order created on backend), then the Razorpay checkout modal opens on the frontend. Verification is done server-side via signature check.
- **Role system** — Users can be `learner`, `expert`, or `both`. Registering as an expert upgrades the role without losing learner access.
