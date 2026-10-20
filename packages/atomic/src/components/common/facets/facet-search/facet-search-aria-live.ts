import type {Facet, FacetSearchState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {ReactiveControllerHost} from 'lit';
import {shouldUpdateFacetSearchComponent} from './facet-search-utils';

/**
 * Announces the number of facet search results through `setAriaLive` whenever a facet search
 * completes. The facet subscription follows the lifecycle of `host`: it is released when the host
 * leaves the DOM and restored when it comes back, without repeating the last announcement.
 */
export function announceFacetSearchResultsWithAriaLive(
  host: ReactiveControllerHost & Element,
  facet: Pick<Facet, 'subscribe'> & {state: {facetSearch: FacetSearchState}},
  label: string,
  setAriaLive: (msg: string) => void,
  i18n: i18n
) {
  let prevState = facet.state.facetSearch;
  let unsubscribe: (() => void) | undefined;

  host.addController({
    hostConnected() {
      if (unsubscribe) {
        return;
      }
      // Headless calls the listener as soon as it subscribes. That call reports the state the
      // facet already shows, so it must not announce it again when the facet comes back.
      let subscribing = true;
      unsubscribe = facet.subscribe(() => {
        const nextState = facet.state.facetSearch;
        if (
          !subscribing &&
          shouldUpdateFacetSearchComponent(nextState, prevState) &&
          nextState.query
        ) {
          setAriaLive(
            i18n.t('facet-search-results-count', {
              count: nextState.values.length,
              label,
            })
          );
        }
        prevState = nextState;
      });
      subscribing = false;
    },
    hostDisconnected() {
      // A move within the DOM, such as `atomic-facet-manager` reordering its facets, reaches
      // this callback once the facet is already back in place: keep the subscription.
      if (host.isConnected) {
        return;
      }
      unsubscribe?.();
      unsubscribe = undefined;
    },
  });
}
