import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/supabase";
import { getStayByToken } from "../stay";

export const dynamic = "force-dynamic";

/**
 * Stripe redirects here after the guest authorises the hold. We confirm with Stripe
 * (never trusting the URL alone) and mark the hold as held.
 * TODO: add a Stripe webhook as a backup in case the guest closes the tab before this runs.
 */
export default async function HoldDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { token } = await params;
  const { session_id } = await searchParams;
  if (!session_id) redirect(`/checkin/${token}`);

  const stay = await getStayByToken(token);
  const session = await stripe().checkout.sessions.retrieve(session_id, { expand: ["payment_intent"] });
  // The session must belong to this stay, or someone could replay another guest's session id.
  if (!stay || session.metadata?.stay_id !== stay.id) redirect(`/checkin/${token}`);
  const pi = session.payment_intent;
  const authorised = pi && typeof pi !== "string" && pi.status === "requires_capture";

  await db()
    .from("card_holds")
    .update({
      stripe_payment_intent_id: pi && typeof pi !== "string" ? pi.id : null,
      status: authorised ? "held" : "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session_id);

  redirect(`/checkin/${token}${authorised ? "" : "?error=" + encodeURIComponent("The card hold did not go through.")}`);
}
