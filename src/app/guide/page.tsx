import Link from "next/link";
import { GUIDEBOOK_EN } from "@/content/guidebook";

// Reads Wi-Fi details from the environment at request time.
export const dynamic = "force-dynamic";

export default function GuidePage() {
  const wifiName = process.env.GUEST_WIFI_NAME;
  const wifiPassword = process.env.GUEST_WIFI_PASSWORD;
  const whatsapp = process.env.HOST_WHATSAPP;

  return (
    <div className="stack">
      <header>
        <h1>Welcome to Split</h1>
        <p className="muted">Everything about the apartment and the city, in one place.</p>
      </header>

      {wifiName && (
        <section className="card" id="wifi">
          <h2>Wi-Fi</h2>
          <p>
            Network: <strong>{wifiName}</strong>
            <br />
            Password: <strong>{wifiPassword}</strong>
          </p>
        </section>
      )}

      <nav className="card" aria-label="Contents">
        <ul>
          {GUIDEBOOK_EN.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {GUIDEBOOK_EN.map((s) => (
        <section className="card" id={s.id} key={s.id}>
          <h2>{s.title}</h2>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.links && (
            <ul>
              {s.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="card">
        <h2>Local tips by email</h2>
        <p>Get our best Split tips and an offer for your next direct stay.</p>
        <Link className="button" href="/join">
          Sign up
        </Link>
      </section>

      {whatsapp && (
        <p className="muted">
          Need us? WhatsApp{" "}
          <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}>{whatsapp}</a>
        </p>
      )}
    </div>
  );
}
