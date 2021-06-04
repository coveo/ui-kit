import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface FacetSearchMatchesProps {
  i18n: i18n;
  query: string;
  numberOfMatches: number;
  hasMoreMatches: boolean;
}

export const FacetSearchMatches: FunctionalComponent<FacetSearchMatchesProps> = (
  props
) => {
  if (!props.numberOfMatches) {
    return (
      <div class="ellipsed p-3 bg-neutral-light text-neutral-dark text-sm">
        {props.i18n.t('noMatchesFoundFor', {
          query: props.query,
          interpolation: {escapeValue: false},
        })}
      </div>
    );
  }

  if (props.hasMoreMatches) {
    return (
      <div class="ellipsed mt-3 text-neutral-dark text-sm">
        {props.i18n.t('moreMatchesFor', {
          query: props.query,
          interpolation: {escapeValue: false},
        })}
      </div>
    );
  }
};
