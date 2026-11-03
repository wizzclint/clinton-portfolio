"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  capabilities,
  engineeringTools,
  demoRequestUrl,
  credentials,
  flagship,
  profile,
  selectedWork,
  timeline,
  venture,
} from "@/data/profile";
import { useClock } from "./Chrome";
import { toggleTheme } from "./Header";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

type Line = { kind: "in" | "out" | "dim" | "err"; text: ReactNode };

const HOST = `visitor@${profile.firstName.toLowerCase()}.dev`;
const CHIPS = ["help", "whoami", "skills", "projects", "certs", "contact", "neofetch", "clear"];

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function bar(score: number) {
  const n = Math.round(score / 5);
  return "█".repeat(n) + "░".repeat(20 - n);
}

function exec(raw: string): Line[] | "clear" {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const out = (text: ReactNode): Line => ({ kind: "out", text });
  switch ((cmd || "").toLowerCase()) {
    case "":
      return [];
    case "help":
      return [
        out("Available commands:"),
        ...[
          ["whoami", "who runs this site"],
          ["about", "the short version"],
          ["skills", "capability profile"],
          ["projects", "things I've built"],
          ["certs", "credentials"],
          ["timeline", "the path here"],
          ["design", "how I design"],
          ["contact", "how to reach me"],
          ["neofetch", "system info, but it's me"],
          ["goto <section>", "scroll to about|lab|work|contact…"],
          ["theme", "toggle light / dark"],
          ["echo <text>", "prints text"],
          ["date", "local time where I am"],
          ["clear", "clear the screen"],
        ].map(([c, d]) =>
          out(
            <>
              {"  "}
              <span className="hl">{c.padEnd(16)}</span>
              {d}
            </>,
          ),
        ),
      ];
    case "whoami":
      return [out(`${profile.firstName} ${profile.lastName} · ${profile.role} · ${profile.location}`)];
    case "about":
      return [
        out("I design products, then build them properly."),
        out("Product & UI/UX design, full-stack development, and data analytics."),
      ];
    case "skills":
      return [
        ...capabilities.map((c) => out(`${c.name.padEnd(28)} ${bar(c.score)} ${c.score}`)),
        ...engineeringTools.map((group) => out(`${group.label}: ${group.tools.join(" · ")}`)),
      ];
    case "projects":
      return [...selectedWork, ...flagship].map((p) =>
        out(
          <>
            <span className="hl">▸ {p.title}</span>
            {"  "}
            {"description" in p ? p.description.slice(0, 80) : p.headline.slice(0, 80)}…
          </>,
        ),
      );
    case "certs":
      return credentials.map((c) => out(`▸ ${c.title} (${c.issued})`));
    case "timeline":
      return timeline.map((t) => out(`${t.when.padEnd(20)} ${t.title}, ${t.org}`));
    case "design":
    case "venture":
      return [out(`${venture.badge} · ${venture.name}`), out(venture.body)];
    case "contact":
      return [
        out(<>email     <a className="hl" href={`mailto:${profile.email}`}>{profile.email}</a></>),
        out(`phone     ${profile.phone}`),
        ...(
          [
            ["github", profile.github],
            ["demo", demoRequestUrl("Design prototypes")],
            ["linkedin", profile.linkedin],
          ] as const
        )
          .filter(([, v]) => v)
          .map(([k, v]) =>
            out(
              <>
                {k.padEnd(10)}
                <a className="hl" href={v} target="_blank" rel="noreferrer">
                  {k === "demo" ? "Request a private design walkthrough" : v}
                </a>
              </>,
            ),
          ),
        out(`location  ${profile.location}`),
      ];
    case "neofetch":
      return [
        out(<span className="hl">{`${HOST}`}</span>),
        out("-".repeat(HOST.length)),
        out(`Name:     ${profile.firstName} ${profile.lastName}`),
        out(`Role:     ${profile.role}`),
        out(`Location: ${profile.location}`),
        out(`Design:   Figma · design systems · prototyping`),
        out(`Stack:    TypeScript · Next.js · Python · MongoDB`),
        out(`Status:   ${profile.available}`),
        out(`Uptime:   caffeinated`),
      ];
    case "goto": {
      const target = (args[0] || "").toLowerCase().replace("#", "");
      const ids = ["about", "capabilities", "lab", "work", "flagship", "credentials", "path", "beyond", "contact"];
      if (!ids.includes(target)) return [{ kind: "err", text: `goto: unknown section. try: ${ids.join(", ")}` }];
      setTimeout(() => go(target), 150);
      return [{ kind: "dim", text: `→ jumping to #${target}` }];
    }
    case "theme":
      toggleTheme();
      return [{ kind: "dim", text: "theme toggled" }];
    case "echo":
      return [out(args.join(" "))];
    case "date":
      return [out(new Date().toLocaleString("en-GB", { timeZone: profile.timezone }) + ` (${profile.tzLabel})`)];
    case "sudo":
      return [{ kind: "err", text: "nice try. this incident will be reported. 🙂" }];
    case "rm":
      return [{ kind: "err", text: "rm: permission denied. the portfolio stays." }];
    case "ls":
      return [out("about  capabilities  lab  work  flagship  credentials  path  beyond  contact")];
    case "clear":
      return "clear";
    default:
      return [{ kind: "err", text: `command not found: ${cmd}. type 'help'` }];
  }
}

export function Terminal() {
  const time = useClock();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const submit = (cmd: string) => {
    const res = exec(cmd);
    if (res === "clear") {
      setLines([]);
    } else {
      setLines((l) => [...l, { kind: "in", text: cmd }, ...res]);
    }
    if (cmd.trim()) setHistory((h) => [cmd, ...h].slice(0, 50));
    setHIdx(-1);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit(value);
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hIdx + 1, history.length - 1);
      if (history[n] !== undefined) {
        setHIdx(n);
        setValue(history[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(Math.max(n, -1));
      setValue(n >= 0 ? history[n] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section id="ask" className="section">
      <div className="container">
        <SectionHead num="02" title="Ask the site">
          A real shell. Type <span className="code">help</span>, or just poke at it. It answers with
          everything on this page.
        </SectionHead>
        <Reveal className="card terminal">
          <div className="term-bar">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
            <span className="who">{HOST}, ~/portfolio, zsh</span>
            <span suppressHydrationWarning>{time}</span>
          </div>
          <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
            <div className="term-line">{profile.firstName.toLowerCase()}.sh, interactive portfolio shell</div>
            <div className="term-line dim">Session opened · nothing you type leaves this browser</div>
            <div className="term-line dim">
              Type <span className="hl">help</span> to see everything, or hit one of the chips below.
            </div>
            <br />
            {lines.map((l, i) => (
              <div key={i} className={`term-line ${l.kind === "dim" ? "dim" : l.kind === "err" ? "err" : ""}`}>
                {l.kind === "in" ? (
                  <>
                    <span className="p">❯ </span>
                    {l.text}
                  </>
                ) : (
                  l.text
                )}
              </div>
            ))}
            <div className="term-input">
              <span className="p" style={{ color: "var(--accent)" }}>
                ❯
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
                aria-label="Terminal input"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="term-chips">
            {CHIPS.map((c) => (
              <button key={c} onClick={() => submit(c)}>
                {c}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
