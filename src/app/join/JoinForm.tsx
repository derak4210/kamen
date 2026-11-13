"use client";

import { useActionState } from "react";
import { joinList, type JoinState } from "./actions";

export function JoinForm({
  consentText,
  source,
  reviewUrl,
}: {
  consentText: string;
  source: "tag" | "tv";
  reviewUrl?: string;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinList, { status: "idle" });

  if (state.status === "ok") {
    return (
      <div className="stack">
        <div className="card">
          <h2>You&apos;re on the list</h2>
          <p>Thanks! We&apos;ll send local tips, and an offer when it&apos;s a good time to come back.</p>
        </div>
        {reviewUrl && (
          // Deliberately separate from the signup and with no reward attached:
          // incentivised or gated reviews break Google's policy and EU consumer law.
          <div className="card">
            <h2>Enjoying Split?</h2>
            <p>An honest Google review helps other travellers find us.</p>
            <a className="button" href={reviewUrl} target="_blank" rel="noreferrer">
              Write a review
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="card stack">
      <input type="hidden" name="source" value={source} />
      <div>
        <label htmlFor="name">Name (optional)</label>
        <input id="name" name="name" type="text" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <label className="check">
        {/* Unticked by default: GDPR requires an active opt-in. */}
        <input type="checkbox" name="consent" required />
        <span>{consentText}</span>
      </label>
      {state.status === "error" && <p className="error">{state.message}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Signing up..." : "Sign up"}
      </button>
      <p className="muted">
        We store your email only for these messages. We never use your registration details for marketing.
      </p>
    </form>
  );
}
