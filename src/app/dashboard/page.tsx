import { db } from "@/lib/supabase";
import { addStay, setWantBack } from "./actions";

export const dynamic = "force-dynamic";

type StayRow = {
  id: string;
  platform: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  guest_count: number | null;
  checkin_token: string;
  registrations: { id: string }[];
  policy_signatures: { id: string }[];
  card_holds: { status: string }[];
};

type ContactRow = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  consented_at: string;
  unsubscribed_at: string | null;
  want_back: boolean | null;
};

export default async function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const appUrl = process.env.APP_URL ?? "";
  const [staysRes, contactsRes] = await Promise.all([
    db()
      .from("stays")
      .select(
        "id, platform, guest_name, check_in, check_out, guest_count, checkin_token, registrations(id), policy_signatures(id), card_holds(status)",
      )
      .gte("check_out", today)
      .order("check_in"),
    db()
      .from("guest_contacts")
      .select("id, email, name, source, consented_at, unsubscribed_at, want_back")
      .order("created_at", { ascending: false }),
  ]);
  const stays = (staysRes.data ?? []) as StayRow[];
  const contacts = (contactsRes.data ?? []) as ContactRow[];

  return (
    <div className="stack">
      <h1>Host dashboard</h1>

      <section className="card stack">
        <h2>Upcoming stays</h2>
        {stays.length === 0 ? (
          <p className="muted">No upcoming stays.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Dates</th>
                <th>Guest</th>
                <th>Registered</th>
                <th>Signed</th>
                <th>Hold</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {stays.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.check_in} to {s.check_out}
                  </td>
                  <td>
                    {s.guest_name ?? "—"} ({s.platform})
                  </td>
                  <td>
                    {s.registrations.length}/{s.guest_count ?? 1}
                  </td>
                  <td>{s.policy_signatures.length > 0 ? "Yes" : "No"}</td>
                  <td>{s.platform === "airbnb" ? "Not needed" : (s.card_holds.at(-1)?.status ?? "None")}</td>
                  <td>
                    <a href={`${appUrl}/checkin/${s.checkin_token}`}>Pre-check-in</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card stack">
        <h2>Add a stay</h2>
        <form action={addStay} className="stack">
          <div>
            <label htmlFor="platform">Platform</label>
            <select id="platform" name="platform" defaultValue="booking">
              <option value="airbnb">Airbnb</option>
              <option value="booking">Booking.com</option>
              <option value="direct">Direct</option>
            </select>
          </div>
          <div>
            <label htmlFor="guest_name">Guest name</label>
            <input id="guest_name" name="guest_name" type="text" />
          </div>
          <div>
            <label htmlFor="check_in">Check-in</label>
            <input id="check_in" name="check_in" type="date" required />
          </div>
          <div>
            <label htmlFor="check_out">Checkout</label>
            <input id="check_out" name="check_out" type="date" required />
          </div>
          <div>
            <label htmlFor="guest_count">Guests</label>
            <input id="guest_count" name="guest_count" type="text" inputMode="numeric" defaultValue="2" required />
          </div>
          <button type="submit">Add stay</button>
        </form>
      </section>

      <section className="card stack">
        <h2>Guest list</h2>
        <p className="muted">Only guests marked &quot;Want back&quot; will get a rebooking code.</p>
        {contacts.length === 0 ? (
          <p className="muted">No signups yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Joined</th>
                <th>Want back</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.name ? `${c.name}, ` : ""}
                    {c.email}
                    {c.unsubscribed_at && <span className="muted"> (unsubscribed)</span>}
                  </td>
                  <td>
                    {c.consented_at.slice(0, 10)} via {c.source}
                  </td>
                  <td>
                    <form action={setWantBack.bind(null, c.id, !c.want_back)}>
                      <button type="submit" className={c.want_back ? undefined : "secondary"}>
                        {c.want_back ? "Yes" : "No"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
