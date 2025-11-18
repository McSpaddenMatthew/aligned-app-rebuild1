# Aligned – Recruiting summaries

Aligned is a Next.js + Supabase app that turns hiring manager inputs and recruiter notes into decision-ready candidate reports.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy required env vars into a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="<your-supabase-url>"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
   SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" # server-only
   OPENAI_API_KEY="<openai-key>" # server-only
   ```
3. Run the database setup in Supabase (SQL below).
4. Start local dev:
   ```bash
   npm run dev
   ```

## Supabase schema

Run `supabase.sql` in the Supabase SQL editor to create the schema and row-level security policies:

- `profiles` table keyed by `auth.users.id` to store `full_name`.
- `summaries` table stores candidate report details, share tokens, and generated JSON reports.
- RLS limits all profile and summary access to the authenticated user (`auth.uid() = user_id`).

## Auth flow

- Magic-link only login on `/login` using Supabase OTP.
- Callback handled at `/auth/callback` (supports both `code` params and fragment tokens).
- Middleware protects authenticated routes; public routes include `/`, `/login`, `/auth/callback`, and `/share/[token]`.
- Logout via POST to `/auth/logout`.

## OpenAI integration

`app/api/summaries/generate` calls OpenAI server-side to turn hiring manager priorities and recruiter notes into a structured JSON report. The API uses `OPENAI_API_KEY` on the server only and writes the report into `summaries.report` while marking the record `ready`.

## Share links

Each summary stores a unique `share_token`. The public view at `/share/[token]` uses the service role key server-side to render a read-only report for hiring managers.
