import DOMPurify from 'dompurify';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-generated-answer-inline-link/atomic-generated-answer-inline-link';
import {transformMarkdownToHtml} from './markdown-utils';

export interface GeneratedMarkdownContentProps {
  answer?: string;
  answerId?: string;
  isStreaming: boolean;
}

export const renderGeneratedMarkdownContent: FunctionalComponent<
  GeneratedMarkdownContentProps
> = ({props}) => {
  const answerAsHtml = DOMPurify.sanitize(
    transformMarkdownToHtml(props.answer ?? '', props.answerId),
    {
      ADD_ATTR: ['part', 'target', 'rel'],
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^atomic-generated-answer-inline-link$/,
        attributeNameCheck: /^(href|answer-id|title|text)$/,
      },
    }
  );

  return html`
    <div
      part="generated-text"
      class="text-on-background mb-0 ${props.isStreaming ? 'cursor' : ''}"
    >
      ${unsafeHTML(answerAsHtml)}
    </div>
  `;
};
