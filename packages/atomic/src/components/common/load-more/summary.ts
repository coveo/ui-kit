import {i18n} from 'i18next';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {ItemKind} from './common-types';

type LoadMoreSummaryLabel = `showing-${ItemKind}-of-load-more`;

interface LoadMoreSummaryProps {
  i18n: i18n;
  from: number;
  to: number;
  label: LoadMoreSummaryLabel;
}

export const loadMoreSummary = ({
  i18n,
  from,
  to,
  label,
}: LoadMoreSummaryProps) => {
  const wrapHighlight = (content: string) => {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  };

  const locale = i18n.language;
  const content = i18n.t(label, {
    interpolation: {escapeValue: false},
    last: wrapHighlight(from.toLocaleString(locale)),
    total: wrapHighlight(to.toLocaleString(locale)),
  });

  return html`
    <div class="text-neutral-dark my-2 text-lg" part="showing-results">
      ${unsafeHTML(content)}
    </div>
  `;
};
