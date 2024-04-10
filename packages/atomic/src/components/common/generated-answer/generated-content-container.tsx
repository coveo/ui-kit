import {FunctionalComponent, h} from '@stencil/core';

interface GeneratedContentContainerProps {
  answer?: string;
  isStreaming: boolean;
}

export const GeneratedContentContainer: FunctionalComponent<
  GeneratedContentContainerProps
> = (props, children) => (
  <div part="generated-container" class="mt-6">
    <p
      part="generated-text"
      class={`mb-0 text-on-background whitespace-pre-wrap ${
        props.isStreaming ? 'cursor' : ''
      }`}
    >
      {props.answer}
    </p>
    <div class="footer mt-6">{children}</div>
  </div>
);
