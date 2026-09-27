"use client";

import { useState } from "react";
import { WORK_CATEGORIES, flagship, profile, selectedWork } from "@/data/profile";
import { ArrowUpRight, LinkIcon, Play, Spark } from "./Icons";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

const FILTERS = ["All work", ...WORK_CATEGORIES] as const;
const CATEGORY_COLORS = ["#34d399", "#60a5fa", "#f59e0b", "#c084fc"];

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function Work() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All work");
  const items = selectedWork.filter((w) => filter === "All work" || w.category === filter);

  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead num="05" title="Selected work">
          Designs, builds and experiments. Open the prototypes, visit the live sites, or read the code.
        </SectionHead>
        <div className="filters" role="tablist">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={f === filter} className={f === filter ? "active" : ""} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="work-grid">
          {items.map((w, i) => (
            <Reveal
              key={w.title}
              delay={(i % 3) * 80}
              className="card work-card"
              onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className="work-top">
                <span>{w.n}</span>
                <span className="pill" style={{ color: CATEGORY_COLORS[WORK_CATEGORIES.indexOf(w.category)] }}>
                  {w.category}
                </span>
              </div>
              <h3>{w.title}</h3>
              <p>{w.description}</p>
              <div className="tags">
                {w.tags.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
              {w.href && (
                <a
                  href={w.href}
                  className="btn btn-sm run-link"
                  {...(isExternal(w.href) ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <LinkIcon size={13} /> {w.linkLabel ?? "Run it"}
                  {isExternal(w.href) && <ArrowUpRight size={12} />}
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATUS_CLASS: Record<string, string> = { Live: "pill-live", Ongoing: "pill-ongoing" };

export function Flagship() {
  return (
    <section id="flagship" className="section">
      <div className="container">
        <SectionHead num="06" title="Flagship builds">
          The serious projects. Designed and built end to end, real systems with real users. Request a
          private walkthrough of any of them.
        </SectionHead>
        <div className="flag-grid">
          {flagship.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 100} className="card flag">
              <div className="flag-top">
                <span className="flag-kicker">{f.kicker}</span>
                <span className={`pill ${STATUS_CLASS[f.status] ?? "pill-built"}`}>{f.status}</span>
              </div>
              <h3>{f.title}</h3>
              <p className="headline">{f.headline}</p>
              <p className="body">{f.body}</p>
              <ul>
                {f.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="tags">
                {f.tags.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
              <div className="flag-foot">
                <span className="year">{f.year}</span>
                <div className="row">
                  {f.live && (
                    <a href={f.live} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                      <Play size={13} /> Launch live app
                    </a>
                  )}
                  <a
                    href={`mailto:${profile.email}?subject=${encodeURIComponent(`Demo request: ${f.title}`)}`}
                    className={`btn btn-sm ${f.live ? "" : "btn-primary"}`}
                  >
                    {!f.live && <Play size={13} />} Request a demo
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="card cta-band">
          <div>
            <h3>Want to see one running, or build something like it?</h3>
            <p>Private demos, design walkthroughs and freelance engagements.</p>
          </div>
          <a href="#contact" className="btn btn-primary">
            <Spark size={15} /> Start a project
          </a>
        </Reveal>
      </div>
    </section>
  );
}
