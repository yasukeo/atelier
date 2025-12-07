# Atelier storefront

Modern e-commerce experience for curated art pieces, built on the Next.js App Router with TypeScript, Prisma, and Tailwind CSS. The app bundles a full storefront, shopping cart, checkout pipeline, contact form, and an authenticated admin area for managing paintings, artists, and discounts.

## Tech stack

- Next.js 15 (App Router) + React 19 with Server/Client Components
- TypeScript, ESLint 9, and Turbopack builds
- Tailwind CSS v4 with custom UI primitives in `components/ui`
- Prisma ORM targeting MySQL (`DATABASE_URL`) with seeds in `prisma/seed.mjs`
- next-auth for credentials + email-based flows
- Vitest + Testing Library for unit/component tests, Playwright for e2e, and Prisma for data access helpers

## Repository layout

- `app/` – routed features (storefront, admin dashboard, checkout, auth, API routes)
- `components/` – shared client-side widgets and shadcn-inspired UI kit
- `lib/` – data access helpers (auth, cart, discounts, media uploads, validation, etc.)
- `prisma/` – schema, migrations, ERD, and seed script
- `tests/` & `e2e/` – Vitest suites and Playwright smoke tests

## Prerequisites

- Node.js 20+ and npm 10+
- MySQL 8 (or a compatible service) accessible via `DATABASE_URL`
- A `.env` file that at minimum defines:
	- `DATABASE_URL="mysql://user:pass@localhost:3306/atelier"`
	- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
	- Any mailer / Cloudinary keys referenced in `lib/email.ts` and `lib/media.ts`

## Setup & development

```bash
# 1. Install dependencies
npm install

# 2. Provision the database
npx prisma migrate deploy
npm run prisma:seed   # optional demo content

# 3. Start the dev server
npm run dev
```

Visit http://localhost:3000 to browse the storefront and http://localhost:3000/admin once you are authenticated.

## Quality checks

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint across the monorepo |
| `npm run test` | Vitest unit/component suites (requires a reachable MySQL instance and seeded data for discount tests) |
| `npm run e2e` | Playwright end-to-end smoke tests (expects a running dev server) |
| `npm run build` | Production build with Turbopack |

> **Note:** In CI-free environments, Vitest discount specs will fail unless MySQL is running on `localhost:3306` with the `atelier` schema. Either start the database (see `prisma/schema.prisma`) or skip those suites with `npm run test -- tests --exclude-pattern=discounts.test.ts`.

## Launching locally

1. Ensure `.env` is populated and the database is reachable.
2. Run `npm run dev` and wait for the `Ready` banner.
3. Open the local URL from the terminal output (defaults to http://localhost:3000).

When you are ready for production, build with `npm run build` and start with `npm start`.

## Troubleshooting

- **Database connection errors** – confirm the `DATABASE_URL` host/port matches your MySQL instance and run `npx prisma migrate dev` to create the schema.
- **Vitest smoke test failures** – `tests/smoke.test.tsx` renders `app/page.tsx`; if you modify the hero image alt text update the test accordingly.
- **Playwright “test() called in config” error** – Run `npm run e2e` from the repo root so Playwright uses `playwright.config.ts` instead of trying to evaluate tests during Vitest runs.
