"use client";

import { useEffect, useState } from "react";
import { GROUP_COLORS, TOOLS } from "./lab/tools";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function ToolLab() {
  const [active, setActive] = useState(TOOLS[0].id);
  const tool = TOOLS.find((t) => t.id === active) ?? TOOLS[0];
  const groups = [...new Set(TOOLS.map((t) => t.group))];

  useEffect(() => {
    const onSelect = (e: Event) => setActive((e as CustomEvent<string>).detail);
    window.addEventListener("lab:select", onSelect);
    return () => window.removeEventListener("lab:select", onSelect);
  }, []);

  return (
    <section id="lab" className="section">
      <div className="container">
        <SectionHead num="04" title="The Tool Lab">
          {TOOLS.length} working tools, not screenshots. Everything executes locally in your browser, no
          server, no telemetry, nothing you type leaves this machine.
        </SectionHead>
        <Reveal className="lab">
          <aside className="card lab-side" aria-label="Tools">
            {groups.map((g) => (
              <div className="lab-group" key={g}>
                <h4 style={{ color: GROUP_COLORS[g] ?? "var(--accent)" }}>◆ {g}</h4>
                {TOOLS.filter((t) => t.group === g).map((t) => (
                  <button key={t.id} className={t.id === active ? "active" : ""} onClick={() => setActive(t.id)}>
                    {t.name}
                  </button>
                ))}
              </div>
            ))}
          </aside>
          <div className="card tool">
            <div className="tool-head">
              <div>
                <h3>{tool.name}</h3>
                <p>{tool.desc}</p>
              </div>
              <span className="pill">100% client-side</span>
            </div>
            <div className="tool-body" key={tool.id}>
              <tool.Component />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
