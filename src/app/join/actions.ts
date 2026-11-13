"use server";

import { z } from "zod";
import { db } from "@/lib/supabase";
import { JOIN_CONSENT_TEXT } from "@/content/consent";


const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal("on"),
  source: z.enum(["tag", "tv"]).default("tag"),
  language: z.string().max(10).optional(),
});

export type JoinState = { status: "idle" | "ok" | "error"; message?: string };

export async function joinList(_prev: JoinState, form: FormData): Promise<JoinState> {
  const parsed = schema.safeParse({
    name: form.get("name") || undefined,
    email: form.get("email"),
    consent: form.get("consent"),
    source: form.get("source") || undefined,
    language: form.get("language") || undefined,
  });
  if (!parsed.success) {
    const consentMissing = parsed.error.issues.some((i) => i.path[0] === "consent");
    return {
      status: "error",
      message: consentMissing
        ? "Please tick the box to agree to receive emails."
        : "Please enter a valid email address.",
    };
  }

  const { name, email, source, language } = parsed.data;
  // Upsert so a returning guest who signs up again doesn't hit an error.
  // A previous unsubscribe is cleared only because they ticked consent again just now.
  const { error } = await db()
    .from("guest_contacts")
    .upsert(
      {
        email,
        name: name ?? null,
        language: language ?? null,
        source,
        consent_text: JOIN_CONSENT_TEXT,
        consented_at: new Date().toISOString(),
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );
  if (error) {
    console.error("joinList failed", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  return { status: "ok" };
}
