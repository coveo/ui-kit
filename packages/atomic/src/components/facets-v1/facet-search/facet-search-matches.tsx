import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import escape from 'escape-html';

interface FacetSearchMatchesProps {
  i18n: i18n;
  query: string;
  numberOfMatches: number;
  hasMoreMatches: boolean;
}

function matchesFound(
  key: 'moreMatchesFor' | 'noMatchesFoundFor',
  query: string,
  i18n: i18n
) {
  return i18n.t(key, {
    query: `<span class="font-bold italic text-on-background" part="matches-query">${escape(
      query
    )}</span>`,
    interpolation: {escapeValue: false},
  });
}

export const FacetSearchMatches: FunctionalComponent<FacetSearchMatchesProps> = (
  props
) => {
  if (!props.numberOfMatches) {
    return (
      <div
        part="no-matches"
        class="ellipsed p-3 bg-neutral-light text-neutral-dark text-sm"
        innerHTML={matchesFound('noMatchesFoundFor', props.query, props.i18n)}
      ></div>
    );
  }

  if (props.hasMoreMatches) {
    return (
      <div
        part="more-matches"
        class="ellipsed mt-3 text-neutral-dark text-sm"
        innerHTML={matchesFound('moreMatchesFor', props.query, props.i18n)}
      ></div>
    );
  }
};
