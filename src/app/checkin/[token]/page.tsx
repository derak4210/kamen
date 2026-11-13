import { notFound } from "next/navigation";
import { DAMAGE_PRICE_LIST, POLICY_CONSENT, POLICY_RULES, POLICY_VERSION } from "@/content/policy";
import { db } from "@/lib/supabase";
import { damageHoldCents } from "@/lib/stripe";
import { addRegistration, signPolicy, startCardHold } from "./actions";
import { getStayByToken, needsCardHold } from "./stay";

export const dynamic = "force-dynamic";

/**
 * Pre-check-in link sent through Airbnb or Booking.com messaging after booking.
 * Logistics only: no discounts or off-platform offers here, to stay within platform rules.
 */
export default async function CheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const stay = await getStayByToken(token);
  if (!stay) notFound();

  const [regs, sigs, holds] = await Promise.all([
    db().from("registrations").select("first_name, last_name").eq("stay_id", stay.id),
    db().from("policy_signatures").select("policy_version").eq("stay_id", stay.id).eq("policy_version", POLICY_VERSION),
    db().from("card_holds").select("status").eq("stay_id", stay.id).in("status", ["held", "captured", "partially_captured"]),
  ]);
  const registered = regs.data ?? [];
  const expected = stay.guest_count ?? 1;
  const regDone = registered.length >= expected;
  const signed = (sigs.data ?? []).length > 0;
  const holdNeeded = needsCardHold(stay);
  const held = (holds.data ?? []).length > 0;
  const allDone = regDone && signed && (!holdNeeded || held);

  return (
    <div className="stack">
      <header>
        <h1>Before you arrive</h1>
        <p className="muted">
          Stay {stay.check_in} to {stay.check_out}. Takes about 2 minutes.
        </p>
      </header>
      {error && <p className="error card">{error}</p>}

      <section className="card stack">
        <h2>1. Guest registration {regDone ? "✓" : `(${registered.length} of ${expected})`}</h2>
        <p className="muted">
          Croatian law requires us to register every guest with the tourist board (eVisitor). These details are used
          only for that.
        </p>
        {registered.length > 0 && (
          <ul>
            {registered.map((r, i) => (
              <li key={i}>
                {r.first_name} {r.last_name}
              </li>
            ))}
          </ul>
        )}
        {!regDone && (
          <form action={addRegistration.bind(null, token)} className="stack">
            <div>
              <label htmlFor="first_name">First name</label>
              <input id="first_name" name="first_name" type="text" required />
            </div>
            <div>
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" name="last_name" type="text" required />
            </div>
            <div>
              <label htmlFor="date_of_birth">Date of birth</label>
              <input id="date_of_birth" name="date_of_birth" type="date" required />
            </div>
            <div>
              <label htmlFor="nationality">Nationality</label>
              <input id="nationality" name="nationality" type="text" required />
            </div>
            <div>
              <label htmlFor="document_type">Document</label>
              <select id="document_type" name="document_type" defaultValue="passport">
                <option value="passport">Passport</option>
                <option value="id_card">ID card</option>
              </select>
            </div>
            <div>
              <label htmlFor="document_number">Document number</label>
              <input id="document_number" name="document_number" type="text" required />
            </div>
            <button type="submit">Add guest</button>
          </form>
        )}
      </section>

      <section className="card stack">
        <h2>2. House rules and damage prices {signed && "✓"}</h2>
        <ul>
          {POLICY_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price (EUR)</th>
            </tr>
          </thead>
          <tbody>
            {DAMAGE_PRICE_LIST.map((d) => (
              <tr key={d.item}>
                <td>{d.item}</td>
                <td>{d.priceEur}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!signed && (
          <form action={signPolicy.bind(null, token)} className="stack">
            <label className="check">
              <input type="checkbox" name="agree" required />
              <span>{POLICY_CONSENT}</span>
            </label>
            <div>
              <label htmlFor="signed_name">Type your full name to sign</label>
              <input id="signed_name" name="signed_name" type="text" required autoComplete="name" />
            </div>
            <button type="submit">Sign</button>
          </form>
        )}
      </section>

      {holdNeeded && (
        <section className="card stack">
          <h2>3. Refundable damage hold {held && "✓"}</h2>
          <p>
            We place a hold of €{damageHoldCents() / 100} on your card. It is not charged, and it is released within
            48 hours of checkout if there is no damage.
          </p>
          {!held && (
            <form action={startCardHold.bind(null, token)}>
              <button type="submit">Add card</button>
            </form>
          )}
        </section>
      )}

      {allDone && (
        <section className="card">
          <h2>All set</h2>
          <p>Thank you! Your arrival instructions and door code will be sent before check-in.</p>
        </section>
      )}
    </div>
  );
}
