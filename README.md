# ElWarcha Atelier

> **Live:** [www.elwarcha.com](https://www.elwarcha.com)

Modern e-commerce storefront for curated art pieces, built on the Next.js App Router with TypeScript, Prisma, and Tailwind CSS. The app bundles a full storefront with painting gallery, shopping cart, checkout pipeline, contact form, and an authenticated admin area for managing paintings, artists, styles, techniques, and discounts.

## Tech stack

- **Next.js 15** (App Router) + **React 19** with Server & Client Components
- **TypeScript**, ESLint 9, and Turbopack builds
- **Tailwind CSS v4** with custom UI primitives in `components/ui`
- **Prisma 6** ORM targeting **PostgreSQL** (Supabase) with seeds in `prisma/seed.mjs`
- **next-auth** for credentials-based authentication (JWT strategy)
- **Cloudinary** for image storage (direct browser-to-Cloudinary signed uploads)
- **Vercel** for hosting
- Vitest + Testing Library for unit/component tests, Playwright for e2e

## Repository layout

- `app/` – routed features (storefront, admin dashboard, checkout, auth, API routes)
- `components/` – shared client-side widgets and shadcn-inspired UI kit
- `lib/` – data access helpers (auth, cart, discounts, media uploads, validation, DB with retry logic)
- `prisma/` – schema, migrations, ERD, and seed script
- `tests/` & `e2e/` – Vitest suites and Playwright smoke tests

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL database (or a Supabase project) accessible via `DATABASE_URL`
- A `.env` file that at minimum defines:
  - `DATABASE_URL="postgresql://user:pass@host:5432/postgres"`
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Any mailer keys referenced in `lib/email.ts`

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

Visit http://localhost:3000 to browse the storefront and http://localhost:3000/admin once you are authenticated as an admin.

## Quality checks

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint across the project |
| `npm run test` | Vitest unit/component suites |
| `npm run e2e` | Playwright end-to-end smoke tests (expects a running dev server) |
| `npm run build` | Production build with Turbopack |

## Deployment

The app is deployed on **Vercel** with automatic deploys from the `main` branch. Ensure the following environment variables are set in your Vercel project:

- `DATABASE_URL` (Supabase Session pooler, port 5432)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Painting images are uploaded directly from the browser to Cloudinary (signed uploads) to bypass Vercel's 4.5 MB body size limit.

## Launching locally

1. Ensure `.env` is populated and the database is reachable.
2. Run `npm run dev` and wait for the `Ready` banner.
3. Open the local URL from the terminal output (defaults to http://localhost:3000).

When you are ready for production, build with `npm run build` and start with `npm start`.

## Troubleshooting

- **Database connection errors** – confirm the `DATABASE_URL` host/port matches your PostgreSQL instance and run `npx prisma migrate dev` to create the schema. The app includes automatic retry logic (3× with exponential backoff) for transient connection failures.
- **Vitest smoke test failures** – `tests/smoke.test.tsx` renders `app/page.tsx`; if you modify the hero image alt text update the test accordingly.
- **Playwright "test() called in config" error** – Run `npm run e2e` from the repo root so Playwright uses `playwright.config.ts` instead of trying to evaluate tests during Vitest runs.
- **Painting upload fails on Vercel** – Ensure Cloudinary env vars are set. Images are uploaded directly from the browser to Cloudinary; only URLs are sent to the API route.
