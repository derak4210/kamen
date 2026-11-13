"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/supabase";

// Server actions can be called by POST from any page, so they are not covered by the
// /dashboard middleware matcher. Each one checks the basic auth header itself.
async function assertHost() {
  const user = process.env.HOST_USER;
  const password = process.env.HOST_PASSWORD;
  const header = (await headers()).get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  const ok =
    !!user &&
    !!password &&
    scheme === "Basic" &&
    !!encoded &&
    Buffer.from(encoded, "base64").toString() === `${user}:${password}`;
  if (!ok) throw new Error("Not authorised");
}

const staySchema = z
  .object({
    platform: z.enum(["airbnb", "booking", "direct"]),
    guest_name: z.string().trim().max(200).optional(),
    check_in: z.string().date(),
    check_out: z.string().date(),
    guest_count: z.coerce.number().int().min(1).max(20),
  })
  .refine((s) => s.check_out > s.check_in, { message: "Checkout must be after check-in" });

/** Manual stay entry until calendar sync arrives in Phase 2. */
export async function addStay(form: FormData) {
  await assertHost();
  const parsed = staySchema.parse({
    platform: form.get("platform"),
    guest_name: form.get("guest_name") || undefined,
    check_in: form.get("check_in"),
    check_out: form.get("check_out"),
    guest_count: form.get("guest_count"),
  });
  const { error } = await db().from("stays").insert(parsed);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/** Marks whether we'd like this guest back. Only want_back guests ever get a rebooking code. */
export async function setWantBack(contactId: string, wantBack: boolean) {
  await assertHost();
  const { error } = await db().from("guest_contacts").update({ want_back: wantBack }).eq("id", contactId);
  if (error) throw error;
  revalidatePath("/dashboard");
}
