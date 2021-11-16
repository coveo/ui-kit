import {TimeframeFacetActions} from '../facets/timeframe-facet/timeframe-facet-actions';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';
import {CategoryFacetActions} from '../facets/category-facet/category-facet-actions';
import {NumericFacetActions} from '../facets/numeric-facet/numeric-facet-actions';
import {FacetActions} from '../facets/facet/facet-actions';

function breadcrumbManagerActions(selector: BreadcrumbManagerSelector) {
  return {
    clickShowMoreNumericFacetBreadcrumb: () => {
      selector.numericFacet().showMoreButton().click();
    },
    clickFirstValueNumericFacetBreadcrumb: () => {
      selector
        .numericFacet()
        .values()
        .first()
        .find('.pill__container')
        .click({force: true});
    },
    clickClearFilters: () => {
      selector.clearFilters().click();
    },
  };
}

export const BreadcrumbManagerActions = {
  ...breadcrumbManagerActions(BreadcrumbManagerSelectors),
  facet: {
    ...FacetActions,
  },
  numerciFacet: {
    ...NumericFacetActions,
  },
  timeFrameFacet: {
    ...TimeframeFacetActions,
  },
  categoryFacet: {
    ...CategoryFacetActions,
  },
};
