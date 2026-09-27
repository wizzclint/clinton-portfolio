import { Fragment } from "react";
import { about, profile } from "@/data/profile";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

/** Tiny formatter: **bold** and *accent* */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((chunk, i) => {
    if (chunk.startsWith("**")) return <strong key={i}>{chunk.slice(2, -2)}</strong>;
    if (chunk.startsWith("*")) return <em key={i}>{chunk.slice(1, -1)}</em>;
    return <Fragment key={i}>{chunk}</Fragment>;
  });
}

function Facts() {
  return (
    <div className="facts">
      {about.facts.map(([k, v]) => (
        <div className="fact" key={k}>
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function About() {
  // With no second photo, the facts table takes the right-hand column instead
  const hasPhoto = !!profile.workPhoto;
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead num="01" title={about.title}>
          {about.lede}
        </SectionHead>
        <div className="about-grid">
          <Reveal>
            <div className="prose">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{rich(p)}</p>
              ))}
            </div>
            {hasPhoto && <Facts />}
          </Reveal>
          <Reveal delay={120}>
            {hasPhoto ? (
              <figure className="work-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.workPhoto} alt={profile.workPhotoCaption} />
                <figcaption>{profile.workPhotoCaption}</figcaption>
              </figure>
            ) : (
              <div className="facts-sticky">
                <Facts />
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
