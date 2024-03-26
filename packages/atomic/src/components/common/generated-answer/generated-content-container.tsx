import {FunctionalComponent, h} from '@stencil/core';

interface GeneratedContentContainerProps {
  answer?: string;
  answerMediaType?: string;
  isStreaming: boolean;
}

export const GeneratedContentContainer: FunctionalComponent<
  GeneratedContentContainerProps
> = (props, children) => (
  <div class="mt-6">
    <p
      part="generated-text"
      class={`mb-0 text-on-background whitespace-pre-wrap ${
        props.isStreaming ? 'cursor' : ''
      }`}
      innerHTML={props.answerMediaType === 'html' ? props.answer : undefined}
    >
      {props.answerMediaType === 'plain' ? props.answer : null}
    </p>
    <div class="footer mt-6">{children}</div>
  </div>
);
