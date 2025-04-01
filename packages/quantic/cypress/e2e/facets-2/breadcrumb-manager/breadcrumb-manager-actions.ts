import {CategoryFacetActions} from '../../facets-1/category-facet/category-facet-actions';
import {FacetActions} from '../../facets-1/facet/facet-actions';
import {NumericFacetActions} from '../numeric-facet/numeric-facet-actions';
import {TimeframeFacetActions} from '../timeframe-facet/timeframe-facet-actions';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
} from './breadcrumb-manager-selectors';

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
        .firstBreadcrumbValueLabel()
        .click({force: true})
        .logAction('when clicking the first value numeric facet breadcrumb');
    },
    clickFirstValueFacetBreadcrumb: () => {
      selector
        .facet()
        .firstBreadcrumbValueLabel()
        .click({force: true})
        .logAction('when clicking the first value facet breadcrumb');
    },
    clickCategoryFacetBreadcrumb: () => {
      selector
        .categoryFacet()
        .firstBreadcrumbValueLabel()
        .click({force: true})
        .logAction('when clicking the category facet breadcrumb');
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
