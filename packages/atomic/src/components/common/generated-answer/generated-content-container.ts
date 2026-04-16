import {html} from 'lit';
import type {InlineLink} from '@coveo/headless';
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
  onSelectInlineLink?: (link: InlineLink) => void;
  onBeginDelayedSelectInlineLink?: (link: InlineLink) => void;
  onCancelPendingSelectInlineLink?: (link: InlineLink) => void;
}

export const renderGeneratedContentContainer: FunctionalComponentWithChildren<
  GeneratedContentContainerProps
> = ({props}) => {
  return (children) => html`
    <div part="generated-container">
      ${props.answerContentFormat === 'text/markdown'
        ? renderGeneratedMarkdownContent({
            props: {
              answer: props.answer,
              isStreaming: props.isStreaming,
              onSelectInlineLink: props.onSelectInlineLink,
              onBeginDelayedSelectInlineLink:
                props.onBeginDelayedSelectInlineLink,
              onCancelPendingSelectInlineLink:
                props.onCancelPendingSelectInlineLink,
            } satisfies GeneratedMarkdownContentProps,
          })
        : renderGeneratedTextContent({
            props: {
              answer: props.answer,
              isStreaming: props.isStreaming,
            } satisfies GeneratedTextContentProps,
          })}
      <div class="footer mt-6">${children}</div>
    </div>
  `;
};
