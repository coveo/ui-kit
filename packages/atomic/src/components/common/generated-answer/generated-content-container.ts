import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {
  type GeneratedMarkdownContentProps,
  renderGeneratedMarkdownContent,
} from './generated-content/generated-markdown-content';
import {
  type GeneratedTextContentProps,
  renderGeneratedTextContent,
} from './generated-content/generated-text-content';

export interface GeneratedContentContainerProps {
  answer?: string;
  answerContentFormat?: string;
  isStreaming: boolean;
}

export const renderGeneratedContentContainer: FunctionalComponentWithChildren<
  GeneratedContentContainerProps
> = ({props}) => {
  return (children) =>
    html`
      <div part="generated-container" class="mt-6">
        ${
          props.answerContentFormat === 'text/markdown'
            ? renderGeneratedMarkdownContent({
                props: {
                  answer: props.answer,
                  isStreaming: props.isStreaming,
                } satisfies GeneratedMarkdownContentProps,
              })
            : renderGeneratedTextContent({
                props: {
                  answer: props.answer,
                  isStreaming: props.isStreaming,
                } satisfies GeneratedTextContentProps,
              })
        }
        <div class="footer mt-6">${children}</div>
      </div>
    `;
};
