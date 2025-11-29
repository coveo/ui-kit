import {FunctionalComponent, h} from '@stencil/core';
import {GeneratedMarkdownContent} from './generated-content/stencil-generated-markdown-content';
import {GeneratedTextContent} from './generated-content/stencil-generated-text-content';

interface GeneratedContentContainerProps {
  answer?: string;
  answerContentFormat?: string;
  isStreaming: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const GeneratedContentContainer: FunctionalComponent<
  GeneratedContentContainerProps
> = (props, children) => {
  return (
    <div part="generated-container" class="mt-6">
      {props.answerContentFormat === 'text/markdown' ? (
        <GeneratedMarkdownContent
          answer={props.answer}
          isStreaming={props.isStreaming}
        />
      ) : (
        <GeneratedTextContent
          answer={props.answer}
          isStreaming={props.isStreaming}
        />
      )}
      <div class="footer mt-6">{children}</div>
    </div>
  );
};
