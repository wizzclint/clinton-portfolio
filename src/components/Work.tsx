"use client";

import { useState } from "react";
import { WORK_CATEGORIES, demoRequestUrl, flagship, selectedWork } from "@/data/profile";
import { Lock, Spark } from "./Icons";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

const FILTERS = ["All work", ...WORK_CATEGORIES] as const;
const COLORS = ["#60a5fa", "#c084fc", "#34d399", "#60a5fa", "#f59e0b"];

// An illustrated overview, not a screenshot of a private application.
function ProjectPreview({ title, labels, color = "var(--accent)" }: { title: string; labels: string[]; color?: string }) {
  return (
    <div className="project-preview" style={{ color }}>
      <svg viewBox="0 0 360 130" role="img" aria-label={`Illustrated overview of ${title}: ${labels.slice(0, 3).join(", ")}`}>
        <path d="M0 26H360M0 65H360M0 104H360M36 0V130M108 0V130M180 0V130M252 0V130M324 0V130" stroke="currentColor" opacity=".08" />
        <path d="M70 65H290" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" opacity=".5" />
        {labels.slice(0, 3).map((label, i) => (
          <g key={label} transform={`translate(${20 + i * 114}, 31)`}>
            <rect width="92" height="68" rx="10" fill="var(--surface)" stroke="currentColor" strokeOpacity=".4" />
            <text x="46" y="27" textAnchor="middle" fill="currentColor" fontSize="15" fontFamily="monospace">{["01", "02", "03"][i]}</text>
            <text x="46" y="48" textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="sans-serif">{label.length > 16 ? label.slice(0, 14) + "…" : label}</text>
          </g>
        ))}
      </svg>
      <div className="preview-caption"><span>Illustrated overview</span><span><Lock size={11} /> Private demo</span></div>
    </div>
  );
}

function DemoLink({ title }: { title: string }) {
  return <a className="btn btn-sm btn-primary run-link" href={demoRequestUrl(title)} aria-label={`Request a demo of ${title}`}><Lock size={13} /> Request a demo</a>;
}

export function Work() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All work");
  const items = selectedWork.filter((w) => filter === "All work" || w.category === filter);
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead num="05" title="Selected work">Explore the problem, approach and tools. Full applications, prototypes and source walkthroughs are available through a private demo.</SectionHead>
        <div className="project-access-note"><Lock size={15} /><span>Public summaries. Private walkthroughs. Choose a project to request access.</span></div>
        <div className="filters" role="group" aria-label="Filter projects">
          {FILTERS.map((f) => <button key={f} aria-pressed={f === filter} className={f === filter ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <div className="work-grid">
          {items.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 80} className="card work-card">
              <div className="work-top"><span>{w.n}</span><span className="pill" style={{ color: COLORS[WORK_CATEGORIES.indexOf(w.category)] }}>{w.category}</span></div>
              <ProjectPreview title={w.title} labels={w.tags} color={COLORS[WORK_CATEGORIES.indexOf(w.category)]} />
              <h3>{w.title}</h3>
              {w.credit && <div className="project-credit">{w.credit}</div>}
              <p>{w.description}</p>
              <div className="tags">{w.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <DemoLink title={w.title} />
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
        <SectionHead num="06" title="Flagship builds">A closer look at the systems behind the interface. Request a private walkthrough of the architecture, features and implementation.</SectionHead>
        <div className="flag-grid">
          {flagship.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 100} className="card flag">
              <div className="flag-top"><span className="flag-kicker">{f.kicker}</span><span className={`pill ${STATUS_CLASS[f.status] ?? "pill-built"}`}>{f.status}</span></div>
              <ProjectPreview title={f.title} labels={f.tags} />
              <h3>{f.title}</h3>
              <p className="headline">{f.headline}</p>
              <p className="body">{f.body}</p>
              <ul>{f.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="tags">{f.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <div className="flag-foot"><span className="year">{f.year}</span><DemoLink title={f.title} /></div>
            </Reveal>
          ))}
        </div>
        <Reveal className="card cta-band">
          <div><h3>Want a closer look?</h3><p>Private demos, design walkthroughs and technical conversations.</p></div>
          <a href={demoRequestUrl()} className="btn btn-primary"><Spark size={15} /> Request a walkthrough</a>
        </Reveal>
      </div>
    </section>
  );
}
