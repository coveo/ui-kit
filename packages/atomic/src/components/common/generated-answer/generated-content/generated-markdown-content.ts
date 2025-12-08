import DOMPurify from 'dompurify';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {transformMarkdownToHtml} from './markdown-utils';

export interface GeneratedMarkdownContentProps {
  answer?: string;
  isStreaming: boolean;
}

export const renderGeneratedMarkdownContent: FunctionalComponent<
  GeneratedMarkdownContentProps
> = ({props}) => {
  const answerAsHtml = DOMPurify.sanitize(
    transformMarkdownToHtml(props.answer ?? ''),
    {ADD_ATTR: ['part']}
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
