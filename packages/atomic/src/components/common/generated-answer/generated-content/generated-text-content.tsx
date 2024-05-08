import {FunctionalComponent, h} from '@stencil/core';

interface GeneratedTextContentProps {
  answer?: string;
  isStreaming: boolean;
}

export const GeneratedTextContent: FunctionalComponent<
  GeneratedTextContentProps
> = (props) => {
  return (
    <p
      part="generated-text"
      class={`mb-0 text-on-background whitespace-pre-wrap ${
        props.isStreaming ? 'cursor' : ''
      }`}
    >
      {props.answer}
    </p>
  );
};
