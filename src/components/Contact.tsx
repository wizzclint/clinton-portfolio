"use client";

import { useState } from "react";
import { contact, demoRequestUrl, profile } from "@/data/profile";
import { copyText } from "@/lib/browser";
import { NAV } from "./Header";
import { ArrowUpRight, Figma, GitHub, LinkedIn, Mail, Phone, Pin, Prompt } from "./Icons";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

const stripProto = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

// Only links that are filled in on the profile get shown
const links = [
  { label: "GitHub", url: profile.github, text: stripProto(profile.github), Icon: GitHub },
  { label: "Private demos", url: demoRequestUrl(), text: "Request a project or design walkthrough", Icon: Figma },
  { label: "LinkedIn", url: profile.linkedin, text: stripProto(profile.linkedin), Icon: LinkedIn },
].filter((l) => l.url);

export function Contact() {
  const [toast, setToast] = useState("");

  const copy = (text: string) => {
    copyText(text);
    setToast("Email copied to clipboard");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionHead num="10" title="Contact" />
        <div className="contact-grid">
          <Reveal>
            <h2 className="display big">
              Let&apos;s build
              <br />
              something
              <br />
              <span className="grad-text">that holds.</span>
            </h2>
            <p className="pitch">{contact.pitch}</p>
            <a
              className="btn btn-primary"
              href={`mailto:${profile.email}?subject=${encodeURIComponent("Freelance enquiry")}`}
            >
              <Prompt size={16} /> Request freelance work
            </a>
          </Reveal>
          <Reveal delay={120} className="channels">
            <div className="channel">
              <Mail size={18} />
              <div>
                <span className="eyebrow">Email</span>
                <p>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </p>
              </div>
              <button className="arrow" aria-label="Copy email" title="Copy" onClick={() => copy(profile.email)}>
                ⧉
              </button>
            </div>
            {profile.phone && (
              <a className="channel" href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                <Phone size={18} />
                <div>
                  <span className="eyebrow">Phone</span>
                  <p>{profile.phone}</p>
                </div>
              </a>
            )}
            {links.map(({ label, url, text, Icon }) => (
              <a key={label} className="channel" href={url} {...(url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                <Icon size={18} />
                <div>
                  <span className="eyebrow">{label}</span>
                  <p>{text}</p>
                </div>
                <ArrowUpRight className="arrow" size={14} />
              </a>
            ))}
            <div className="channel">
              <Pin size={18} />
              <div>
                <span className="eyebrow">Location</span>
                <p>{profile.location}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      {toast && <div className="card toast">{toast}</div>}
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2 className="display">
              {profile.firstName}
              <br />
              {profile.lastName}
            </h2>
            <p>{profile.footerBlurb}</p>
          </div>
          <div>
            <h4 className="eyebrow">Navigate</h4>
            <ul>
              {[...NAV, { id: "contact", label: "Contact" }].map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">Elsewhere</h4>
            <ul>
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.url} {...(l.url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{l.label} ↗</a>
                </li>
              ))}
              <li>
                <a href={`mailto:${profile.email}`}>Email ↗</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
          </span>
          <span>Built with Next.js. No tracker, no cookie banner.</span>
          <span className="ok">
            <i className="status-dot" /> All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
