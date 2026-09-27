"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { profile } from "@/data/profile";
import { Close, Menu, Moon, Search, Sun } from "./Icons";

export const NAV = [
  { id: "about", label: "About" },
  { id: "capabilities", label: "Capabilities" },
  { id: "lab", label: "Tool Lab" },
  { id: "work", label: "Work" },
  { id: "credentials", label: "Credentials" },
];

// Which nav item lights up while each section is on screen
const SECTION_TO_NAV: Record<string, string> = {
  top: "about",
  about: "about",
  ask: "about",
  capabilities: "capabilities",
  lab: "lab",
  work: "work",
  flagship: "work",
  credentials: "credentials",
  path: "credentials",
  beyond: "credentials",
  contact: "contact",
};

export function openPalette() {
  window.dispatchEvent(new Event("palette:open"));
}

export function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
  window.dispatchEvent(new Event("theme:change"));
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useLayoutEffect(() => {
    // Re-apply after React's dev remount clears the attribute
    try {
      const saved = localStorage.getItem("theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch {}
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    window.addEventListener("theme:change", read);
    return () => window.removeEventListener("theme:change", read);
  }, []);
  return theme;
}

export function Header() {
  const theme = useTheme();
  const [active, setActive] = useState("about");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = Object.keys(SECTION_TO_NAV)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(SECTION_TO_NAV[visible[0].target.id]);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <a href="#top" className="brand" aria-label="Back to top">
          <span className="brand-badge">{profile.initials}</span>
          <span className="brand-text">
            <span className="brand-name">
              {profile.firstName} {profile.lastName}
            </span>
            <br />
            <span className="brand-role">{profile.role}</span>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? "active" : ""}>
              {n.label}
            </a>
          ))}
          <a href="#contact" className={`hire ${active === "contact" ? "active" : ""}`}>
            Hire me
          </a>
        </nav>

        <div className="header-tools">
          <button className="search-btn" onClick={openPalette} aria-label="Open command palette">
            <Search size={14} />
            <span className="label">Search</span>
            <span className="kbd">⌘K</span>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile">
          {[...NAV, { id: "contact", label: "Hire me" }].map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
