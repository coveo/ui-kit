import {FunctionalComponent, h} from '@stencil/core';

interface GeneratedTextContentProps {
  answer?: string;
  isStreaming: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const GeneratedTextContent: FunctionalComponent<
  GeneratedTextContentProps
> = (props) => {
  return (
    <p
      part="generated-text"
      class={`text-on-background mb-0 whitespace-pre-wrap ${
        props.isStreaming ? 'cursor' : ''
      }`}
    >
      {props.answer}
    </p>
  );
};
