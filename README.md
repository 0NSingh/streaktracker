# Streak Tracker

Declare what you're learning, log daily entries, build streaks, and share your journey with a public learning log page.

Built with [Next.js 16](https://nextjs.org), [Prisma 7](https://prisma.io), PostgreSQL, and [Jotai](https://jotai.org) for state management.

## Features

- **Email/password auth** — custom auth with bcryptjs and JWT cookies (no third-party auth provider)
- **Learning goals** — create goals with auto-generated shareable slugs
- **Daily entries** — log what you learned each day, with optional notes and weight (1–5)
- **Streak tracking** — current streak, best streak, and days active displayed per goal
- **Activity heatmap** — 6-month GitHub-style contribution grid
- **Edit history** — every edit is recorded with previous/new values
- **Date-range filters** — filter the entry log by date
- **Shareable links** — anyone can view your learning log at `/g/{slug}` without signing in
- **Dashboard** — overview of all goals with streak metrics

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.11 (App Router, Turbopack) |
| Database | PostgreSQL |
| ORM | Prisma 7.9.0 with `@prisma/adapter-pg` |
| Auth | bcryptjs + jsonwebtoken (HttpOnly cookies) |
| State | Jotai |
| Styling | Tailwind CSS |
| Fonts | Geist (Vercel) |
| Tests | Vitest |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (a `docker-compose.yml` or local instance)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 3. Push the Prisma schema to your database
npx prisma db push

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing

```bash
npm test           # run all tests
npm run test:watch # watch mode
```

## Project Structure

```
├── app/
│   ├── api/auth/*         # Auth endpoints (signup, signin, signout, me)
│   ├── api/goals/*        # Goals and entries CRUD
│   ├── g/[slug]           # Public shareable goal page
│   ├── (pages)/dashboard  # User dashboard
│   ├── (pages)/signin     # Sign-in page
│   ├── (pages)/signup     # Sign-up page
│   └── page.tsx           # Landing page
├── packages/
│   ├── db/                # Prisma schema (multi-file)
│   └── lib/               # Utilities (auth, streak, slug, store)
├── tests/                 # Vitest test files
└── prisma.config.ts       # Prisma 7 configuration
```

## Future Improvements

### Goals structured into Roadmaps

Instead of flat goals, organize learning into structured roadmaps. A roadmap would contain multiple goals at different stages (planned, in-progress, completed) and topics/subtopics. Each goal could reference a skill tree, letting users visualize their learning path end-to-end.

### AI-powered resource search

Integrate an AI agent that can:

- Search the web for relevant tutorials, docs, and courses based on the user's goal title and entry notes
- Recommend resources and attach them to entries or goals
- Answer questions like "What should I study next?" based on the user's learning history

### Additional ideas

- Spaced repetition reminders for goals with low recent activity
- Streak freeze items (like Duolingo)
- Public profile page aggregating all goals
- Export learning log as markdown/PDF
- Weekly email summaries
- Mobile-responsive improvements with PWA support
