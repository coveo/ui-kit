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
      selector
        .numericFacet()
        .showMoreButton()
        .click()
        .logAction(
          'when clicking the button show more numeric facet breadcrumb'
        );
    },
    clickFirstValueNumericFacetBreadcrumb: () => {
      selector
        .numericFacet()
        .firstbreadcrumbValueLabel()
        .click({force: true})
        .logAction('when clicking the first value numeric facet breadcrumb');
    },
    clickClearFilters: () => {
      selector
        .clearFilters()
        .click()
        .logAction('when clicking "Clear All Filters"');
    },
  };
}

export const BreadcrumbManagerActions = {
  ...breadcrumbManagerActions(BreadcrumbManagerSelectors),
  facet: {
    ...FacetActions,
  },
  numericFacet: {
    ...NumericFacetActions,
  },
  timeframeFacet: {
    ...TimeframeFacetActions,
  },
  categoryFacet: {
    ...CategoryFacetActions,
  },
};
