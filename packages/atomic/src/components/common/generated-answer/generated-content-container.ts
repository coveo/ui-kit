import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
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
  id?: string;
}

export const renderGeneratedContentContainer: FunctionalComponentWithChildren<
  GeneratedContentContainerProps
> = ({props}) => {
  return (children) => html`
    <div part="generated-container" id=${ifDefined(props.id)}>
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
      <div class="footer">${children}</div>
    </div>
  `;
};
