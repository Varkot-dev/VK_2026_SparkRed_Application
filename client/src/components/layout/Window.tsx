import type { ReactNode } from 'react';

type WindowProps = {
  eyebrow: string;
  heading: string;
  children: ReactNode;
  foot: ReactNode;
};

/** The box-office window: blue head with bulbs, a speak-through grille, the counter, and the small print. */
export function Window({ eyebrow, heading, children, foot }: WindowProps) {
  return (
    <section className="window" aria-labelledby="window-heading">
      <div className="window__head">
        <p className="window__k">{eyebrow}</p>
        <p className="window__mark" aria-hidden="true">
          Mar<span>quee</span>
        </p>
        <h1 id="window-heading" className="window__h">
          {heading}
        </h1>
      </div>
      <div className="grille" aria-hidden="true" />
      <div className="window__body">{children}</div>
      <div className="window__foot">{foot}</div>
    </section>
  );
}
