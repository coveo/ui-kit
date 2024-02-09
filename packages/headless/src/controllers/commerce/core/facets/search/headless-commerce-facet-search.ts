import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {FacetSearchSection} from '../../../../../state/state-sections';
import {
  FacetSearchProps,
  buildFacetSearch,
} from '../../../../core/facets/facet-search/specific/headless-facet-search';

export type CommerceFacetSearch = ReturnType<typeof buildCommerceFacetSearch>;

export function buildCommerceFacetSearch(
  engine: CommerceEngine<FacetSearchSection>,
  props: FacetSearchProps
) {
  const {
    clear,
    exclude,
    search,
    select,
    singleExclude,
    singleSelect,
    state,
    updateText,
  } = buildFacetSearch(engine, props);

  return {
    clear,
    exclude,
    search,
    select,
    singleExclude,
    singleSelect,
    state,
    updateText,
  };
}
