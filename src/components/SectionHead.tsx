import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHead({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className="section-head">
      <span className="watermark" aria-hidden>
        {num}
      </span>
      <h2 className="display">
        <span className="section-num">{num}</span>
        {title}
      </h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}
