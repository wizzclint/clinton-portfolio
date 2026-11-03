"use client";

import { useEffect, useState } from "react";
import { credentials, profile, timeline, venture } from "@/data/profile";
import { ArrowUpRight, Award, Close, Pen } from "./Icons";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

type Cred = (typeof credentials)[number];

function CredArt({ c }: { c: Cred }) {
  if (c.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.image} alt={`${c.title} certificate`} />;
  }
  return (
    <div className="cred-ph">
      <Award size={34} strokeWidth={1.4} />
      <span>{c.issuer}</span>
      <b>{c.title}</b>
    </div>
  );
}

export function Credentials() {
  const [open, setOpen] = useState<Cred | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="credentials" className="section">
      <div className="container">
        <SectionHead num="07" title="Credentials">
          Proof of the learning. Click any card to view the full certificate.
        </SectionHead>
        <div className="cred-grid">
          {credentials.map((c, i) => (
            <Reveal key={c.title} delay={(i % 4) * 70}>
              <button className="card cred" style={{ width: "100%", height: "100%" }} onClick={() => setOpen(c)}>
                <div className="cred-img">
                  <CredArt c={c} />
                  <span className="cred-view">VIEW ▸</span>
                </div>
                <div className="cred-body">
                  <span className="eyebrow">
                    {c.issuer} · {c.level}
                  </span>
                  <h3>{c.title}</h3>
                  <div className="cred-dates">
                    <span>{c.issued}</span>
                    <span>{c.expires ? `exp ${c.expires}` : "No expiry"}</span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
        {profile.credly && (
          <div className="cred-more">
            <a href={profile.credly} target="_blank" rel="noreferrer" className="btn btn-primary">
              <Award size={15} /> View every credential
            </a>
            More certifications than shown here
          </div>
        )}
      </div>

      {open && (
        <div className="overlay" onMouseDown={() => setOpen(null)}>
          <div className="card modal" role="dialog" aria-label={open.title} onMouseDown={(e) => e.stopPropagation()}>
            <div className="tool-head">
              <div>
                <h3>{open.title}</h3>
                <p>
                  {open.issuer} · {open.level} · {open.issued}
                  {open.expires && ` → ${open.expires}`}
                  {open.number && ` · No. ${open.number}`}
                </p>
              </div>
              <button className="icon-btn" onClick={() => setOpen(null)} aria-label="Close">
                <Close />
              </button>
            </div>
            <div className="cred-img" style={{ aspectRatio: "1.29" }}>
              <CredArt c={open} />
            </div>
            {open.url && (
              <div style={{ padding: 18 }}>
                <a href={open.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                  Verify at source <ArrowUpRight size={13} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function Timeline() {
  return (
    <section id="path" className="section">
      <div className="container">
        <SectionHead num="08" title="The path here">
          From UI patterns to shipped products, most recent first.
        </SectionHead>
        <div className="timeline">
          {timeline.map((t, i) => (
            <Reveal key={`${t.when}-${t.title}`} className="tl-item" delay={i * 60}>
              <span className="tl-when">{t.when}</span>
              <h3>{t.title}</h3>
              <div className="tl-org">{t.org}</div>
              <p>{t.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Beyond() {
  return (
    <section id="beyond" className="section">
      <div className="container">
        <SectionHead num="09" title="Beyond the code">
          {venture.sectionLede}
        </SectionHead>
        <Reveal className="card venture">
          <div>
            <span className="venture-badge">
              <Pen size={13} /> {venture.badge}
            </span>
            <h3 className="display">{venture.name}</h3>
            <p className="lede">
              {venture.lede.map((p, i) =>
                p.accent ? (
                  <span className="acc" key={i}>{p.text}</span>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>
            <p className="body">{venture.body}</p>
            <a href={venture.url} className="btn btn-venture">
              <Pen size={15} /> {venture.cta}
              <small>{venture.urlLabel}</small>
            </a>
          </div>
          <div className="venture-side">
            <div className="leaf">
              <Pen size={46} strokeWidth={1.5} />
            </div>
            <ul>
              {venture.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
