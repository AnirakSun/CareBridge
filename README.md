# CareBridge

Healthcare document-sharing and communication prototype built with Next.js, Prisma (SQLite), and private on-disk uploads.

**Synthetic data only — not for production PHI.**

## Prerequisites

- Node.js 22+ and npm
- macOS/Linux/WSL (Windows untested)

If Node is not installed globally, this repo may include a local toolchain under `.tools/` (gitignored).

## Setup

```bash
cp .env.example .env
npm install
npm run db:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Browse **Organizations** to open a facility profile (specialties, locations, fictional providers), then submit documents to that org from the detail page.

After login, click your **name** in the header (or **Profile & devices**) to edit your profile and connect demo wearables (Oura Ring, Apple Watch, Garmin, etc.). Connected devices are noted on new submissions.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit/integration tests |
| `npm run test:e2e` | Playwright E2E (install browsers first) |
| `npm run db:reset` | Migrate + seed demo data |

### Playwright browsers

```bash
npx playwright install chromium
```

## Demo accounts (seed)

Password for all seeded users: `Password123!`

| Role | Email |
|------|-------|
| Riverside admin | `admin.riverside@carebridge.demo` |
| Northlake admin | `admin.northlake@carebridge.demo` |
| Multi-org admin | `admin.multi@carebridge.demo` |
| Submitter A | `submitter.a@carebridge.demo` |
| Submitter B | `submitter.b@carebridge.demo` |

## Architecture

- **UI:** Next.js App Router, Tailwind CSS, Radix-based components
- **Auth:** Database-backed sessions (`Session` table + httpOnly cookie)
- **Authorization:** `src/server/authz.ts` + scoped Prisma queries
- **Files:** Private `storage/uploads/`, served via `GET /api/documents/[id]/download`
- **Messaging:** REST + SWR polling (10s)

## Demo walkthrough

1. Landing page → Register as submitter
2. Organizations directory → New submission to Riverside General Hospital
3. Dashboard shows **Submitted**
4. Log in as `admin.riverside@carebridge.demo` → see queue item (Northlake admin does not)
5. Open submission → preview PDF → set **Under Review** → send info request message
6. As submitter → unread indicator → reply → upload additional file if status is **Additional Information Requested**
7. Admin marks **Completed** → submitter timeline updates
8. Attempt `/admin` as submitter → access denied

## Deployment path (optional, not configured)

1. Swap Prisma provider to PostgreSQL
2. Move uploads to private S3-compatible storage with signed URLs
3. Deploy Next.js to Vercel/Render with secrets for `DATABASE_URL`, `SESSION_SECRET`
4. Add WAF, monitoring, and compliance controls listed in `docs/limitations.md`

## Testing status

See [docs/test-log.md](docs/test-log.md) for the verification checklist and results.
