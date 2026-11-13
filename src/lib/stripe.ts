import "server-only";
import Stripe from "stripe";
import { requireEnv } from "./env";

let client: Stripe | undefined;

export function stripe(): Stripe {
  client ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return client;
}

/** Damage hold in cents. Card authorisations expire after about 7 days, so create the hold close to arrival. */
export function damageHoldCents(): number {
  const eur = Number(process.env.DAMAGE_HOLD_EUR ?? "200");
  return Math.round((Number.isFinite(eur) && eur > 0 ? eur : 200) * 100);
}
