import type {FunctionComponent, PropsWithChildren} from 'react';

interface SectionProps extends PropsWithChildren {
  title: string;
}

export const Section: FunctionComponent<SectionProps> = (props) => {
  return (
    <section className="section-card">
      <h2 className="section-title">{props.title}</h2>
      {props.children}
    </section>
  );
};
