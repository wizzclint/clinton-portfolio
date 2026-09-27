"use client";

import { useEffect, useState } from "react";
import { heroCard, heroIntro, marquee, profile, stats } from "@/data/profile";
import { useClock } from "./Chrome";
import { openPalette } from "./Header";
import { Prompt, User } from "./Icons";
import { useInView } from "./Reveal";

function Typewriter({ words }: { words: string[] }) {
  // Start with the first role fully typed so it reads correctly before JS loads
  const [text, setText] = useState(words[0]);
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    let delay = deleting ? 40 : 85;
    if (!deleting && text === word) delay = 1800;
    if (deleting && text === "") delay = 300;
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setI((n) => n + 1);
      } else setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words]);

  return (
    <p className="typed" aria-label={words.join(", ")}>
      <span aria-hidden>{text}</span>
      <span className="caret" aria-hidden />
    </p>
  );
}

function Counter({ value, suffix, run }: { value: number; suffix: string; run: boolean }) {
  // Server-rendered with the real value; counts up from 0 once in view
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return (
    <div className="stat-value">
      {n}
      {suffix && <sup>{suffix}</sup>}
    </div>
  );
}

export function Hero() {
  const time = useClock();
  const [statsRef, statsIn] = useInView<HTMLDivElement>(0.3);

  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div>
          <h1 className="display">
            {profile.firstName}
            <br />
            <span className="grad-text">{profile.lastName}</span>
          </h1>
          <Typewriter words={profile.typedRoles} />
          <p className="hero-intro">
            {heroIntro.parts.map((p, i) =>
              p.strong ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>,
            )}
          </p>
          <div className="hero-ctas">
            <a href="#lab" className="btn btn-primary">
              <Prompt size={16} /> Run my tools
            </a>
            <a href="#work" className="btn">
              See the work
            </a>
            <button className="btn" onClick={openPalette}>
              ⌘K Command palette
            </button>
          </div>
          <div className="stats" ref={statsRef}>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <Counter value={s.value} suffix={s.suffix} run={statsIn} />
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-side">
          <div className="portrait">
            <div className="scan" />
            {profile.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo} alt={`${profile.firstName} ${profile.lastName}`} />
            ) : (
              <div className="portrait-empty">
                <User size={96} strokeWidth={1} />
              </div>
            )}
            <div className="portrait-meta">
              <div>
                <b>Subject</b>
                {profile.firstName.charAt(0)}. {profile.lastName}
              </div>
              <div>
                <b>Mode</b>
                Design + Code
              </div>
            </div>
          </div>
          <div className="card info-card">
            {heroCard.map(([k, v]) => (
              <div className="info-row" key={k}>
                <span>{k}</span>
                <span suppressHydrationWarning>
                  {k === "status" && <i className="status-dot" />}
                  {v === "__clock__" ? time : v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-hint" aria-label="Scroll to about">
        SCROLL
        <i />
      </a>

      <div className="marquee" aria-label="Skills">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((m, i) => (
            <span className="marquee-item" key={i} aria-hidden={i >= marquee.length}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
