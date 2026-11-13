"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { POLICY_VERSION } from "@/content/policy";
import { requireEnv } from "@/lib/env";
import { damageHoldCents, stripe } from "@/lib/stripe";
import { db } from "@/lib/supabase";
import { getStayByToken } from "./stay";

function back(token: string, error?: string): never {
  redirect(`/checkin/${token}${error ? `?error=${encodeURIComponent(error)}` : ""}`);
}

const registrationSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  date_of_birth: z.string().date(),
  nationality: z.string().trim().min(2).max(60),
  document_type: z.enum(["passport", "id_card"]),
  document_number: z.string().trim().min(3).max(40),
});

/** Adds one guest's eVisitor details. Called once per guest in the party. */
export async function addRegistration(token: string, form: FormData) {
  const stay = await getStayByToken(token);
  if (!stay) back(token, "This link is not valid.");

  const parsed = registrationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(token, "Please fill in every registration field.");

  const { error } = await db()
    .from("registrations")
    .insert({ ...parsed.data, stay_id: stay.id });
  if (error) {
    console.error("addRegistration failed", error);
    back(token, "Could not save the registration. Please try again.");
  }
  back(token);
}

/** Records the e-signature of the current policy version. */
export async function signPolicy(token: string, form: FormData) {
  const stay = await getStayByToken(token);
  if (!stay) back(token, "This link is not valid.");

  const name = String(form.get("signed_name") ?? "").trim();
  if (!name || form.get("agree") !== "on") back(token, "Type your full name and tick the box to sign.");

  const h = await headers();
  const { error } = await db().from("policy_signatures").insert({
    stay_id: stay.id,
    policy_version: POLICY_VERSION,
    signed_name: name.slice(0, 200),
    ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
  });
  if (error) {
    console.error("signPolicy failed", error);
    back(token, "Could not save your signature. Please try again.");
  }
  back(token);
}

/**
 * Starts the damage hold: a Stripe Checkout payment with manual capture, so the card is
 * authorised but not charged. The host captures part or all of it only if damage is found,
 * otherwise it is released after checkout.
 */
export async function startCardHold(token: string) {
  const stay = await getStayByToken(token);
  if (!stay) back(token, "This link is not valid.");

  const appUrl = requireEnv("APP_URL");
  const amount = damageHoldCents();
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: {
            name: "Refundable damage hold",
            description: "Authorised, not charged. Released after checkout if there is no damage.",
          },
        },
      },
    ],
    payment_intent_data: {
      capture_method: "manual",
      metadata: { stay_id: stay.id },
    },
    metadata: { stay_id: stay.id },
    success_url: `${appUrl}/checkin/${token}/done?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkin/${token}`,
  });

  const { error } = await db().from("card_holds").insert({
    stay_id: stay.id,
    stripe_checkout_session_id: session.id,
    amount_cents: amount,
    status: "pending",
  });
  if (error) {
    console.error("startCardHold failed", error);
    back(token, "Could not start the card hold. Please try again.");
  }
  redirect(session.url!);
}
