import DOMPurify from 'dompurify';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {InlineLink} from '@coveo/headless';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {transformMarkdownToHtml} from './markdown-utils';

export interface GeneratedMarkdownContentProps {
  answer?: string;
  isStreaming: boolean;
  onSelectInlineLink?: (link: InlineLink) => void;
  onBeginDelayedSelectInlineLink?: (link: InlineLink) => void;
  onCancelPendingSelectInlineLink?: (link: InlineLink) => void;
}

export const renderGeneratedMarkdownContent: FunctionalComponent<
  GeneratedMarkdownContentProps
> = ({props}) => {
  const answerAsHtml = DOMPurify.sanitize(
    transformMarkdownToHtml(props.answer ?? ''),
    {ADD_ATTR: ['part', 'target', 'rel']}
  );

  const extractInlineLink = (event: Event): InlineLink | null => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return null;
    }

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) {
      return null;
    }

    return {
      linkText: anchor.innerText,
      linkURL: anchor.href,
    };
  };

  const handleInlineLinkInteraction =
    (callback?: (link: InlineLink) => void) => (event: Event) => {
      const link = extractInlineLink(event);
      if (!link) {
        return;
      }

      callback?.(link);
    };

  return html`
    <div
      part="generated-text"
      class="text-on-background mb-0 ${props.isStreaming ? 'cursor' : ''}"
      @click=${handleInlineLinkInteraction(props.onSelectInlineLink)}
      @contextmenu=${handleInlineLinkInteraction(props.onSelectInlineLink)}
      @mousedown=${handleInlineLinkInteraction(props.onSelectInlineLink)}
      @mouseup=${handleInlineLinkInteraction(props.onSelectInlineLink)}
      @touchstart=${handleInlineLinkInteraction(
        props.onBeginDelayedSelectInlineLink
      )}
      @touchend=${handleInlineLinkInteraction(
        props.onCancelPendingSelectInlineLink
      )}
    >
      ${unsafeHTML(answerAsHtml)}
    </div>
  `;
};
