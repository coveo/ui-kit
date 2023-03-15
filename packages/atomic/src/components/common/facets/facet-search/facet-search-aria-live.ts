import {i18n} from 'i18next';
import {Facet, FacetSearchState} from '../../types';
import {shouldUpdateFacetSearchComponent} from './facet-search-utils';

export function announceFacetSearchResultsWithAriaLive(
  facet: Pick<Facet, 'subscribe'> & {state: {facetSearch: FacetSearchState}},
  label: string,
  setAriaLive: (msg: string) => void,
  i18n: i18n
) {
  let prevState = facet.state.facetSearch;
  facet.subscribe(() => {
    if (
      shouldUpdateFacetSearchComponent(facet.state.facetSearch, prevState) &&
      facet.state.facetSearch.query
    ) {
      prevState = facet.state.facetSearch;

      setAriaLive(
        i18n.t('facet-search-results-count', {
          count: facet.state.facetSearch.values.length,
          label,
        })
      );
    }
  });
}
