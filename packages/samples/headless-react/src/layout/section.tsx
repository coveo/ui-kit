interface SectionProps {
  title: string;
}

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  return (
    <div>
      <p>{props.title}</p>
      {props.children}
    </div>
  );
};
