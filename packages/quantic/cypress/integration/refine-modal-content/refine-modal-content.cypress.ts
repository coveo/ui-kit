import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {RefineContentExpectations as Expect} from './refine-modal-content-expectations';
import {RefineContentActions as Actions} from './refine-modal-content-actions';
import {scope} from '../../reporters/detailed-collector';

interface RefineContentOptions {
  hideSort: boolean;
}

describe('quantic-refine-content', () => {
  const pageUrl = 's/quantic-refine-modal-content';

  function visitRefineContent(
    options: Partial<RefineContentOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  describe('when using default options', () => {
    it('should render the duplicated facets and the sort component', () => {
      visitRefineContent();

      scope('when loading the page', () => {
        Expect.displayFiltersTitle();
        Expect.displayClearAllFiltersButton();
        Expect.displayFacetManager();
        Expect.displayDuplicatedNumericFacet();
        Expect.displayDuplicatedFacet();
        Expect.displayDuplicatedCategoryFacet();
        Expect.displayDuplicatedTimeframeFacet();
        Expect.displaySort(true);
        Expect.correctFacetsOrder();
      });

      scope('when selecting values from the duplicated facets', () => {
        Actions.clickDuplicatedTimeframeFacetExpandButton();
        Actions.clickDuplicatedTimeframeFacetFirstOption();
        Expect.displayDuplicatedTimeframeFacetClearFiltersButton(true);
        Expect.displayTimeframeFacetClearFiltersButton(true);
        Actions.clickDuplicatedFacetExpandButton();
        Actions.clickDuplicatedFacetFirstOption();
        Expect.displayDuplicatedFacetClearFiltersButton(true);
        Expect.displayFacetClearFiltersButton(true);
        Expect.correctFacetsOrder();
      });

      scope('when clearing all filters', () => {
        Actions.clickClearAllFilters();
        Expect.displayDuplicatedTimeframeFacetClearFiltersButton(false);
        Expect.displayTimeframeFacetClearFiltersButton(false);
        Expect.displayDuplicatedFacetClearFiltersButton(false);
        Expect.displayFacetClearFiltersButton(false);
        Expect.correctFacetsOrder();
      });
    });
  });

  describe('when hideSort property is set to true', () => {
    it('should render only the duplicated facets', () => {
      visitRefineContent({
        hideSort: true,
      });

      scope('when loading the page', () => {
        Expect.displayFiltersTitle();
        Expect.displayClearAllFiltersButton();
        Expect.displayFacetManager();
        Expect.displayDuplicatedNumericFacet();
        Expect.displayDuplicatedFacet();
        Expect.displayDuplicatedCategoryFacet();
        Expect.displayDuplicatedTimeframeFacet();
        Expect.displaySort(false);
        Expect.correctFacetsOrder();
      });
    });
  });
});
