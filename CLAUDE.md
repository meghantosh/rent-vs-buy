# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rent-vs-buy calculator — a Next.js 16 app that compares renting vs buying a home over 30 years across multiple price points and loan terms (15yr/30yr). Users can save calculations, share them via public links, and view a dashboard of saved calculations.

## Commands

- `npm run dev` — start dev server (Next.js with Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — run unit tests (vitest, looks in `tests/**/*.test.ts`)
- `npm run test:e2e` — Playwright end-to-end tests (in `e2e/`)
- `npx drizzle-kit push` — push schema changes to Neon database
- `npx drizzle-kit generate` — generate migration files

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Drizzle ORM, Neon Postgres, NextAuth v5 (beta), Recharts, shadcn/ui (base-ui).

**Calculator engine** (`src/lib/calculator/`): Pure computation, no React dependencies.
- `types.ts` — `CalculatorInputs` drives everything; `CalculatorResults` is the output
- `engine.ts` — `computeResults(inputs)` builds 6 scenarios (3 prices × 2 loan terms) and produces 30-year projections
- `taxes.ts` / `tax-brackets.ts` — California Prop 13 property tax + federal/state tax benefit calculations
- `mortgage.ts` — amortization math (monthly payment, remaining balance, interest per year)
- `defaults.ts` — default input values

**Client-side state:** `src/hooks/use-calculator.ts` manages form state and calls `computeResults`. The calculator page (`src/components/calculator/calculator-page.tsx`) is client-side; results are computed in the browser, not on the server.

**Auth:** NextAuth v5 with JWT sessions, Google OAuth + email/password credentials. Drizzle adapter stores users in Neon. Middleware protects `/dashboard` routes.

**API routes** (`src/app/api/`):
- `calculations/` — CRUD for saved calculations (stored as JSONB inputs)
- `calculations/[id]/share/` — generate share links
- `auth/register/` — email/password registration (bcrypt)

**Database:** Neon serverless Postgres. Schema in `src/lib/db/schema.ts`. Config reads `DATABASE_URL` from `.env.local`.

**UI components:** `src/components/ui/` — shadcn/ui primitives. `src/components/calculator/` — calculator-specific components (charts, tables, forms).

## Environment

Requires `.env.local` with at minimum `DATABASE_URL` (Neon connection string). Auth also needs `AUTH_SECRET` and optionally `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`.
