import type {Facet, FacetSearchState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {ReactiveControllerHost} from 'lit';
import {shouldUpdateFacetSearchComponent} from './facet-search-utils';

/**
 * Announces the number of facet search results through `setAriaLive` whenever a facet search
 * completes. The facet subscription follows the lifecycle of `host`: it is released when the host
 * leaves the DOM and restored when it comes back.
 */
export function announceFacetSearchResultsWithAriaLive(
  host: ReactiveControllerHost,
  facet: Pick<Facet, 'subscribe'> & {state: {facetSearch: FacetSearchState}},
  label: string,
  setAriaLive: (msg: string) => void,
  i18n: i18n
) {
  let prevState = facet.state.facetSearch;
  let unsubscribe: (() => void) | undefined;

  host.addController({
    hostConnected() {
      unsubscribe ??= facet.subscribe(() => {
        const nextState = facet.state.facetSearch;
        if (shouldUpdateFacetSearchComponent(nextState, prevState) && nextState.query) {
          setAriaLive(
            i18n.t('facet-search-results-count', {
              count: nextState.values.length,
              label,
            })
          );
        }
        prevState = nextState;
      });
    },
    hostDisconnected() {
      unsubscribe?.();
      unsubscribe = undefined;
    },
  });
}
