import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface LoadMoreSummaryProps {
  i18n: i18n;
  from: number;
  to: number;
  label?: 'showing-results-of-load-more' | 'showing-products-of-load-more';
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const LoadMoreSummary: FunctionalComponent<LoadMoreSummaryProps> = ({
  i18n,
  from,
  to,
  label,
}) => {
  const wrapHighlight = (content: string) => {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  };

  const locale = i18n.language;
  const content = i18n.t(label || 'showing-results-of-load-more', {
    interpolation: {escapeValue: false},
    last: wrapHighlight(from.toLocaleString(locale)),
    total: wrapHighlight(to.toLocaleString(locale)),
  });

  return (
    <div
      class="text-neutral-dark my-2 text-lg"
      part="showing-results"
      innerHTML={content}
    ></div>
  );
};
