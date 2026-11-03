"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { demoRequestUrl, flagship, profile, selectedWork } from "@/data/profile";
import { copyText } from "@/lib/browser";
import { TOOLS, selectTool } from "./lab/tools";
import { toggleTheme } from "./Header";
import { Search } from "./Icons";

type Cmd = { group: string; label: string; hint: string; run: () => void };

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Cmd[]>(
    () => [
      { group: "Navigate", label: "About", hint: "#about", run: () => go("about") },
      { group: "Navigate", label: "Ask the site (terminal)", hint: "#ask", run: () => go("ask") },
      { group: "Navigate", label: "Capabilities", hint: "#capabilities", run: () => go("capabilities") },
      { group: "Navigate", label: "Tool Lab", hint: "#lab", run: () => go("lab") },
      { group: "Navigate", label: "Selected work", hint: "#work", run: () => go("work") },
      { group: "Navigate", label: "Flagship builds", hint: "#flagship", run: () => go("flagship") },
      { group: "Navigate", label: "Credentials", hint: "#credentials", run: () => go("credentials") },
      { group: "Navigate", label: "The path here", hint: "#path", run: () => go("path") },
      { group: "Navigate", label: "Contact", hint: "#contact", run: () => go("contact") },
      ...TOOLS.map((t) => ({
        group: "Tools",
        label: t.name,
        hint: t.group,
        run: () => {
          selectTool(t.id);
          go("lab");
        },
      })),
      ...[...selectedWork, ...flagship].map((p) => ({
        group: "Projects",
        label: p.title,
        hint: "request demo",
        run: () => { window.location.href = demoRequestUrl(p.title); },
      })),
      { group: "Actions", label: "Toggle light / dark theme", hint: "theme", run: toggleTheme },
      {
        group: "Actions",
        label: "Copy email address",
        hint: profile.email,
        run: () => copyText(profile.email),
      },
      ...(
        [
          ["Open GitHub", profile.github],
          ["Request a design walkthrough", demoRequestUrl("Design prototypes")],
          ["Open LinkedIn", profile.linkedin],
        ] as const
      )
        .filter(([, url]) => url)
        .map(([label, url]) => ({
          group: "Actions",
          label,
          hint: "external",
          run: () => { if (url.startsWith("mailto:")) window.location.href = url; else window.open(url, "_blank", "noopener"); },
        })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => `${c.label} ${c.group} ${c.hint}`.toLowerCase().includes(s));
  }, [q, commands]);

  useEffect(() => {
    const show = () => {
      setQ("");
      setSel(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            setQ("");
            setSel(0);
          }
          return !o;
        });
      }
    };
    window.addEventListener("palette:open", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("palette:open", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const run = (c: Cmd) => {
    setOpen(false);
    setTimeout(c.run, 10);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[sel]) run(filtered[sel]);
  };

  let lastGroup = "";

  return (
    <div className="overlay" onMouseDown={() => setOpen(false)}>
      <div
        className="card modal"
        role="dialog"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-input">
          <Search size={18} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            placeholder="Jump to a section, tool or project…"
            aria-label="Search commands"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="palette-list">
          {filtered.length === 0 && <div className="palette-empty">Nothing matches “{q}”.</div>}
          {filtered.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <div key={`${c.group}-${c.label}`}>
                {header && <div className="palette-group eyebrow">{header}</div>}
                <button
                  className={`palette-item ${i === sel ? "sel" : ""}`}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => run(c)}
                >
                  <span>{c.label}</span>
                  <span>{c.hint}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
