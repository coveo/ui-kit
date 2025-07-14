import type {FunctionComponent, PropsWithChildren} from 'react';

interface SectionProps extends PropsWithChildren {
  title: string;
}

export const Section: FunctionComponent<SectionProps> = (props) => {
  return (
    <div>
      <p>{props.title}</p>
      {props.children}
    </div>
  );
};
