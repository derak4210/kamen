import { JoinForm } from "./JoinForm";
import { JOIN_CONSENT_TEXT } from "@/content/consent";

export const dynamic = "force-dynamic";

/**
 * Landing page for the NFC/QR tag in the apartment (and the QR on the TV screen, with ?src=tv).
 * The offer is for joining the list. It is never tied to leaving a review.
 */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  return (
    <div className="stack">
      <h1>Split tips from your hosts</h1>
      <p className="muted">
        Join our list for local recommendations, plus a private offer for your next direct stay outside peak
        season.
      </p>
      <JoinForm
        consentText={JOIN_CONSENT_TEXT}
        source={src === "tv" ? "tv" : "tag"}
        reviewUrl={process.env.GOOGLE_REVIEW_URL}
      />
    </div>
  );
}
