# SkillLink

> A marketplace to discover, book, and learn from verified local experts — online or offline.

**Live:** [skilllink-web-tdij.vercel.app](https://skilllink-web-tdij.vercel.app)

---

## The Problem

Finding someone to teach you a skill — badminton, guitar, spoken English, yoga — is harder than it should be. You either rely on word of mouth, scroll through unverified listings, or give up. On the other side, skilled people in your city have no easy way to monetize what they know without building a following first.

SkillLink fixes both sides of that equation.

---

## What It Does

SkillLink is a two-sided platform where **learners** discover and book sessions with **experts**, and experts manage their availability, pricing, and incoming requests — all in one place.

### For Learners
- Search experts by skill, category, mode (online/offline), and max price
- View expert profiles with bio, skills, ratings, and reviews
- Pick a date and available time slot
- Pay online via Razorpay or request an offline session
- Track bookings, complete payment, cancel, and leave reviews

### For Experts
- Register through a guided 3-step onboarding: profile → skills → pricing & availability
- Accept or reject booking requests
- Mark completed sessions
- View earnings, upcoming sessions, and booking history on a dashboard

---

## Thought Process Behind Building This

The product was designed around two core principles:

**1. Lowest friction to first booking**
A learner should be able to go from landing on the site to completing a booking in under 3 minutes. That means no mandatory sign-up walls before browsing, a simple slot picker that doesn't require back-and-forth with the expert, and an inline checkout without redirects.

**2. Experts own their availability**
Unlike platforms that manage scheduling on behalf of experts, SkillLink gives experts full control — they set recurring weekly slots, define pricing per skill, and choose whether they accept online or offline bookings. The system enforces their rules, not the other way around.

**On the technical side**, the architecture separates concerns cleanly: Supabase handles identity (Google OAuth), the backend issues its own JWTs for API access, and Razorpay handles payments server-side (order creation + signature verification) so the frontend never touches money directly. This keeps each layer independently replaceable.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | File-based routing, server components, strong TypeScript support |
| Styling | Tailwind CSS | Rapid UI iteration without context switching |
| Auth | Supabase + Google OAuth | Handles OAuth complexity; we exchange for our own JWT for API access |
| Backend API | Node.js + Express + Prisma | Lightweight, typed ORM, easy schema migrations |
| Database | PostgreSQL (via Supabase) | Relational data model fits bookings/slots/reviews well |
| Payments | Razorpay | India-first, strong test mode, webhook support |
| Frontend Deploy | Vercel | Zero-config Next.js deploys, preview environments |
| Backend Deploy | Render | Simple Node.js hosting, auto-deploy from GitHub |

---

## Architecture

```
Browser
  │
  ├── Supabase Auth (Google OAuth)
  │     └── Returns Supabase access token
  │
  ├── SkillLink Frontend (Vercel)
  │     ├── Exchanges Supabase token → backend JWT
  │     ├── All API calls use backend JWT
  │     └── Razorpay checkout (opens modal, frontend only)
  │
  └── SkillLink API (Render)
        ├── POST /api/v1/auth/google   — token exchange
        ├── GET  /api/v1/experts       — discovery
        ├── POST /api/v1/bookings      — create booking
        ├── POST /api/v1/payments/initiate  — create Razorpay order
        ├── POST /api/v1/payments/verify   — verify signature
        └── PostgreSQL (via Prisma)
```

**Key design decisions:**
- **Dual auth layer**: Supabase for identity, backend JWT for authorization. This keeps the API independent of Supabase and allows role-based access control.
- **Slot locking**: A distributed lock (Redis-style) prevents two learners from booking the same slot simultaneously during checkout.
- **Idempotent payments**: If a user closes the Razorpay modal and returns, the existing Razorpay order is reused — no duplicate charges.
- **Role upgrade**: A learner registering as an expert gets role `both`, not a separate account. One login, two modes.

---

## Project Structure

```
skilllink-web/
├── app/
│   ├── page.tsx              # Home — expert discovery, search, filters
│   ├── login/                # Google sign-in page
│   ├── auth/callback/        # OAuth callback handler
│   ├── expert/[id]/          # Expert profile + slot picker + booking
│   ├── booking/confirm/      # Checkout summary + Razorpay payment
│   ├── bookings/             # Learner booking history + actions
│   ├── dashboard/            # Expert dashboard — earnings, requests
│   ├── register-expert/      # 3-step expert onboarding
│   ├── profile/              # User profile + sign out
│   ├── terms-of-service/
│   └── privacy-policy/
│
├── components/
│   ├── TopBar.tsx            # Header with user avatar menu + logout
│   ├── BottomNav.tsx         # Mobile bottom navigation
│   ├── Toast.tsx             # Notification toasts
│   └── Providers.tsx         # Auth + toast context wrapper
│
└── lib/
    ├── api.ts                # Typed API client — all backend calls in one place
    ├── auth-context.tsx      # Auth state: user, signIn, signOut, refreshUser
    └── supabase.ts           # Supabase client initialisation
```

---

## Booking Flow (End to End)

```
Learner visits expert profile
  → Selects pricing tier + date + time slot
  → Clicks "Confirm Booking"
  → Booking created (status: requested)
  → Expert sees request on dashboard → Accepts
  → Booking status: accepted
  → Learner sees "Complete Payment" CTA
  → Razorpay order created on backend
  → Learner completes payment in Razorpay modal
  → Backend verifies signature → Booking confirmed
  → Both parties see confirmed session
  → After session → Expert marks complete
  → Learner can leave a review
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with Google OAuth configured
- A [Razorpay](https://razorpay.com) account (test mode works)
- The [SkillLink API](https://github.com/chiragmee/skilllink-api) running locally or deployed

### Setup

```bash
# Clone
git clone https://github.com/chiragmee/skilllink-web.git
cd skilllink-web

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in your values — see table below

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values. Never commit `.env.local`.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `NEXT_PUBLIC_API_URL` | Your backend URL (e.g. `https://your-api.onrender.com`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys → Key ID |

---

## Backend

The API lives in a separate repository: [github.com/chiragmee/skilllink-api](https://github.com/chiragmee/skilllink-api)

Stack: Node.js · Express · Prisma · PostgreSQL · Razorpay · Supabase JWT verification

---

## Deployment

### Frontend (Vercel)
1. Import `chiragmee/skilllink-web` into Vercel
2. Add all four environment variables in Project Settings
3. Deploy — Vercel auto-deploys on every push to `main`

### Backend (Render)
1. Import `chiragmee/skilllink-api` into Render as a Web Service
2. Set environment variables including `ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`
3. Render auto-deploys on every push to `main`

---

## What's Built vs. What's Next

### Built
- [x] Google OAuth + JWT auth flow
- [x] Expert discovery with search, category, mode, and price filters
- [x] Expert profile with slot picker and booking flow
- [x] Razorpay online payment + offline request flow
- [x] Expert onboarding (bio, skills, pricing, availability)
- [x] Expert dashboard with booking management
- [x] Learner booking history with cancel and review
- [x] User avatar menu with logout from every page

### Planned (Tier 2)
- [ ] Profile picture upload
- [ ] Custom category creation during onboarding
- [ ] Payment preference per expert (online / offline / both)
- [ ] Expert configuration page (edit slots, pricing post-onboarding)
- [ ] Homepage filter UX redesign
- [ ] Push notifications for booking updates

---

## License

MIT
