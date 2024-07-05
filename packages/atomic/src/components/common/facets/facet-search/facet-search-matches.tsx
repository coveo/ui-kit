import {FunctionalComponent, h} from '@stencil/core';
import escape from 'escape-html';
import {i18n} from 'i18next';
import {Button} from '../../button';

interface FacetSearchMatchesProps {
  i18n: i18n;
  query: string;
  numberOfMatches: number;
  hasMoreMatches: boolean;
  showMoreMatches?: () => void;
}

function matchesFound(
  key: 'more-matches-for' | 'no-matches-found-for',
  query: string,
  i18n: i18n
) {
  return i18n.t(key, {
    query: `<span class="font-bold italic" part="matches-query">${escape(
      query
    )}</span>`,
    interpolation: {escapeValue: false},
  });
}

export const FacetSearchMatches: FunctionalComponent<
  FacetSearchMatchesProps
> = (props) => {
  if (!props.numberOfMatches) {
    return (
      <div class="px-2">
        <div
          part="no-matches"
          class="truncate p-3 bg-neutral-light text-neutral-dark text-sm rounded"
          innerHTML={matchesFound(
            'no-matches-found-for',
            props.query,
            props.i18n
          )}
        ></div>
      </div>
    );
  }

  if (props.hasMoreMatches) {
    if (props.showMoreMatches) {
      return (
        <div class="px-2">
          <Button
            style="text-primary"
            class="mt-3 p-2"
            onClick={props.showMoreMatches}
          >
            <div
              part="more-matches"
              class="truncate text-sm"
              innerHTML={matchesFound(
                'more-matches-for',
                props.query,
                props.i18n
              )}
            ></div>
          </Button>
        </div>
      );
    }
    return (
      <div class="px-2">
        <div
          part="more-matches"
          class="truncate mt-3 text-neutral-dark text-sm"
          innerHTML={matchesFound('more-matches-for', props.query, props.i18n)}
        ></div>
      </div>
    );
  }
};
