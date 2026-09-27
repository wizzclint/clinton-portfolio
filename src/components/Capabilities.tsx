"use client";

import { useState } from "react";
import { capabilities } from "@/data/profile";
import { Reveal, useInView } from "./Reveal";
import { SectionHead } from "./SectionHead";

const SIZE = 420;
const C = SIZE / 2;
const R = 130;

function point(i: number, n: number, r: number) {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const;
}

function Radar({ grow }: { grow: boolean }) {
  const n = capabilities.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = capabilities.map((c, i) => point(i, n, (R * c.score) / 100).join(",")).join(" ");
  return (
    <svg viewBox={`-30 0 ${SIZE + 60} ${SIZE}`} role="img" aria-label="Capability radar chart">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--grad-1)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--grad-3)" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {rings.map((r) => (
        <polygon
          key={r}
          points={capabilities.map((_, i) => point(i, n, R * r).join(",")).join(" ")}
          fill="none"
          stroke="var(--border-strong)"
          strokeDasharray={r < 1 ? "2 4" : undefined}
        />
      ))}
      {capabilities.map((_, i) => {
        const [x, y] = point(i, n, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--border)" />;
      })}
      <g
        style={{
          transformOrigin: `${C}px ${C}px`,
          transform: `scale(${grow ? 1 : 0.05})`,
          transition: "transform 1.2s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <polygon points={poly} fill="url(#radarFill)" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        {capabilities.map((c, i) => {
          const [x, y] = point(i, n, (R * c.score) / 100);
          return <circle key={c.name} cx={x} cy={y} r={4.5} fill={c.color} stroke="var(--surface)" strokeWidth={2} />;
        })}
      </g>
      {capabilities.map((c, i) => {
        const [x, y] = point(i, n, R + 30);
        const anchor = Math.abs(x - C) < 10 ? "middle" : x > C ? "start" : "end";
        const words = c.short.toUpperCase().split(" ");
        const mid = Math.ceil(words.length / 2);
        const lines = words.length > 2 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [words.join(" ")];
        return (
          <text
            key={c.name}
            x={x}
            y={y - (lines.length - 1) * 6}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9.5"
            letterSpacing="0.8"
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {lines.map((l, j) => (
              <tspan key={j} x={x} dy={j === 0 ? 0 : 12}>
                {l}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export function Capabilities() {
  const [open, setOpen] = useState<number | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <section id="capabilities" className="section">
      <div className="container">
        <SectionHead num="03" title="What I do">
          {capabilities.length} disciplines that keep feeding each other. Tap any row for detail.
        </SectionHead>
        <div className="cap-grid" ref={ref}>
          <Reveal className="card radar-card">
            <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status-dot" /> Capability profile
            </div>
            <Radar grow={inView} />
            <div className="radar-legend">
              {capabilities.map((c) => (
                <span key={c.name}>
                  <i style={{ background: c.color }} />
                  {c.name} · {c.score}
                </span>
              ))}
            </div>
          </Reveal>
          <div className="cap-list">
            {capabilities.map((c, i) => (
              <Reveal key={c.name} delay={i * 60}>
                <button
                  className={`cap-item ${open === i ? "open" : ""}`}
                  style={{ width: "100%" }}
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <div className="cap-top">
                    <span className="diamond" style={{ background: c.color }} />
                    <h3>{c.name}</h3>
                    <span className="score">{c.score}/100</span>
                  </div>
                  <div className="cap-bar">
                    <i style={{ width: inView ? `${c.score}%` : 0, background: c.color }} />
                  </div>
                  <div className="cap-detail">
                    <p>{c.detail}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
