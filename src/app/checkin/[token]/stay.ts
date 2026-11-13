import "server-only";
import { db } from "@/lib/supabase";

export type Stay = {
  id: string;
  platform: "airbnb" | "booking" | "direct";
  guest_name: string | null;
  check_in: string;
  check_out: string;
  guest_count: number | null;
};

export async function getStayByToken(token: string): Promise<Stay | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const { data, error } = await db()
    .from("stays")
    .select("id, platform, guest_name, check_in, check_out, guest_count")
    .eq("checkin_token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Whether this stay needs a card hold. Booking.com and direct guests: yes, because Booking.com
 * offers no reliable damage cover. Airbnb guests: no by default; AirCover plus the signed
 * policy is the route, and any deposit must be disclosed in the Airbnb listing first.
 */
export function needsCardHold(stay: Stay): boolean {
  return stay.platform !== "airbnb";
}
