# Kamen

Guest tool for a short-term rental apartment in Split, Croatia (Airbnb and Booking.com).

It covers a multilingual guidebook, a pre-check-in flow (eVisitor details, an e-signed rental policy, a damage card hold), consented guest email capture from an NFC/QR tag, a turnover photo log, and rebooking offers for chosen guests.

> This repository is **public**. Never commit secrets, guest data, passport details, or real door codes. Keep them in environment variables or the database.

## Getting started

1. Create a Supabase project in an EU region and run `supabase/migrations/0001_init.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm install`, then `npm run dev` and open http://localhost:3000.

## Pages

| Path | Who | What |
| --- | --- | --- |
| `/guide` | Guests | Guidebook for the apartment and Split |
| `/join` | Guests, from the NFC/QR tag (`/join?src=tv` from the TV) | Email signup with consent, then an unrewarded Google review ask |
| `/checkin/<token>` | Guests, linked from platform messages | eVisitor details, e-signed house rules and damage price list, card hold (not for Airbnb stays) |
| `/dashboard` | Host (basic auth) | Upcoming stays and their pre-check-in status, add a stay, guest list with a "want back" toggle |

The build plan, guardrails and later phases are summarised in `CLAUDE.md`.
