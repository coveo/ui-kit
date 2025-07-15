import type {i18n} from 'i18next';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface LoadMoreSummaryProps {
  i18n: i18n;
  from: number;
  to: number;
  label?: 'showing-results-of-load-more' | 'showing-products-of-load-more';
}

export const renderLoadMoreSummary: FunctionalComponent<
  LoadMoreSummaryProps
> = ({props}) => {
  const {i18n, from, to, label} = props;

  const wrapHighlight = (content: string) => {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  };

  const locale = i18n.language;
  const content = i18n.t(label || 'showing-results-of-load-more', {
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
