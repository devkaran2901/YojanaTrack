# YojanaTrack

YojanaTrack is a full-stack MERN application that helps Indian citizens discover 
government welfare schemes they're actually eligible for — not just search by keyword.

Instead of a binary "eligible / not eligible" result, YojanaTrack scores how well a 
user matches each scheme, explains exactly which criteria they fail and by how much, 
and proactively notifies matching users when a new scheme is added — turning a static 
directory into a system that actively works on the citizen's behalf.

## Features
- Rule-based eligibility scoring engine — schemes are ranked by match score (not just 
  filtered in/out), with per-criterion pass/fail feedback so users know exactly what's 
  missing
- Automated new-scheme notifications — when an admin adds a scheme, it's matched 
  against every user's profile in the background and eligible users are notified in-app
- Standalone profile management — intentional, validated citizen profile (age, income, 
  gender, state, occupation) reused by both the scoring engine and the notification 
  system
- Redis-cached scheme search — TTL-based caching with write-through invalidation on 
  scheme create/update/delete
- Search and filter schemes by category, state, and eligibility
- Detailed scheme pages with benefits, required documents, and application process
- Save and track schemes, including an application tracker with deadline checks
- JWT authentication with refresh token rotation
- Admin dashboard for scheme management

## Tech Stack
- Frontend: React, Vite, TypeScript, TailwindCSS
- Backend: Node.js, Express, TypeScript, Zod request validation
- Database: MongoDB + Mongoose
- Caching: Redis (TTL + write-through invalidation, graceful degradation on failure)
- Testing: Jest + Supertest, 33 tests covering auth, schemes, profile, notifications, 
  and caching behavior
- CI/CD: GitHub Actions (lint, test, build on every push)
