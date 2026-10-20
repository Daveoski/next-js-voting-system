# Live Voting System (Next.js)

A full-stack voting app built with **Next.js 16**, **React 19** and **TypeScript**. Votes go to a server-side API route, and the page shows a live tally, a leaderboard and a winner announcement.

**Live demo:** https://next-js-voting-system.vercel.app

## Features

- `GET /api/votes` returns the current tally; `POST /api/votes` casts a vote
- Server-side duplicate-voter check (each voter can vote only once)
- Typed error codes shared between the API and the UI
- Live clock, total vote count, ranked leaderboard and winner modal
- `useVotes` custom hook that keeps the API calls out of the components
- The in-memory store survives hot reloads in development

## Getting started

```bash
bun install        # or: npm install
bun dev            # or: npm run dev
```

Open http://localhost:3000.

> Votes are held in memory, so they reset when the server restarts. A database would be the next step for production use.

## Project structure

```text
src/
├── components/voting/   # VoteForm, TallyBoard, Leaderboard, TotalVotes, LiveClock, WinnerModal
├── hooks/use-votes.ts   # Client-side data hook
├── lib/voting.ts        # Shared types, candidates, ranking and winner logic
├── server/vote-store.ts # In-memory vote store
└── pages/
    ├── index.tsx
    └── api/votes.ts     # GET / POST votes
```

## Tech stack

Next.js 16 (Pages Router) · React 19 · TypeScript · Tailwind CSS v4 · Vercel

## License

[MIT](LICENSE)
