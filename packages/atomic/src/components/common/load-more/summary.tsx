import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface LoadMoreSummaryProps {
  i18n: i18n;
  from: number;
  to: number;
}

export const LoadMoreSummary: FunctionalComponent<LoadMoreSummaryProps> = ({
  i18n,
  from,
  to,
}) => {
  const wrapHighlight = (content: string) => {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  };

  const locale = i18n.language;
  const content = i18n.t('showing-results-of-load-more', {
    interpolation: {escapeValue: false},
    last: wrapHighlight(from.toLocaleString(locale)),
    total: wrapHighlight(to.toLocaleString(locale)),
  });

  return (
    <div
      class="my-2 text-lg text-neutral-dark"
      part="showing-results"
      innerHTML={content}
    ></div>
  );
};
