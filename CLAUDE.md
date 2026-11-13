# Kamen

Guest tool for one short-term rental apartment in Split, Croatia, listed on Airbnb and Booking.com.
Build plan: https://claude.ai/artifact/QEkDZzu8v4QLMf6Smi94pi

## Stack
Next.js 15 (App Router, TypeScript), Supabase Postgres (EU region, service role key used only on the server), Stripe (manual capture for damage holds). Schema lives in `supabase/migrations/`.

## Guardrails (do not break these)
- The repository is public. No secrets, guest data, Wi-Fi passwords or door codes in code. Use env vars (`.env.example`) or the database.
- No discounts or off-platform offers in anything sent through Airbnb or Booking.com messaging. The pre-check-in link (`/checkin/[token]`) carries logistics only.
- Never reward or gate reviews. The Google review ask is shown to everyone who signs up and is never tied to the discount.
- GDPR: consent checkboxes are unticked by default, the exact consent text is stored with a timestamp, every email has unsubscribe. eVisitor registration data is never used for marketing.
- Rebooking codes are single-use, tied to one guest marked `want_back`, and exclude peak months.

## Commands
- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`
