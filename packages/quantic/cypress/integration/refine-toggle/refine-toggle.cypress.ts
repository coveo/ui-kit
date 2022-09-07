import {configure} from '../../page-objects/configurator';

import {RefineToggleExpectations as Expect} from './refine-toggle-expectations';
import {RefineToggleActions as Actions} from './refine-toggle-actions';
import {scope} from '../../reporters/detailed-collector';
import {
  InterceptAliases,
  interceptSearch,
  mockSearchNoResults,
  mockSearchWithoutAnyFacetValues,
  mockSearchWithResults,
} from '../../page-objects/search';
import {
  addFacets,
  addFacetsWithoutInputs,
} from '../../page-objects/actions/action-add-facets';

interface RefineToggleOptions {
  fullScreen: boolean;
  hideSort: boolean;
  title: string;
}

const viewResultsLabel = (value: number) => {
  return `View results (${new Intl.NumberFormat().format(value)})`;
};

const customRefineModalTitle = 'Custom Title';
const customRefineToggleLabel = 'Custom Label';
const defaultRefineToggleTitle = 'Sort & Filters';
const customRefineToggleTitle = 'Filters';

describe('quantic-refine-toggle', () => {
  const pageUrl = 's/quantic-refine-toggle';

  function visitPage(
    options: Partial<RefineToggleOptions> = {},
    returnResults = true,
    returnFacetValues = true
  ) {
    interceptSearch();
    if (returnResults) {
      if (returnFacetValues) {
        mockSearchWithResults();
      } else {
        mockSearchWithoutAnyFacetValues();
      }
    } else {
      mockSearchNoResults();
    }
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when no facets are registered', () => {
    describe('when using default options', () => {
      it('should render the refine toggle component', () => {
        visitPage();

        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.refineToggleTitleContains(defaultRefineToggleTitle);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(true);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });

          scope('when closing the refine modal', () => {
            Actions.clickRefineModalCloseButton();
            Expect.displayModal(false);
          });

          scope('when clicking on the view results button', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Actions.clickViewResultsButton();
            Expect.displayModal(false);
          });
        });
      });
    });

    describe('when the hideSort property is set to true', () => {
      it('should disable the refine toggle button', () => {
        visitPage({hideSort: true});
        cy.wait(InterceptAliases.Search);

        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(true);
        });
      });
    });

    describe('when there is no results', () => {
      it('should disable the refine toggle component', () => {
        visitPage({}, false);
        cy.wait(InterceptAliases.Search);

        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(true);
        });
      });
    });
  });

  describe('when facets with inputs are used in the search interface', () => {
    describe('when using default options', () => {
      it('should render the refine toggle component', () => {
        visitPage();
        addFacets();
        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.refineToggleTitleContains(defaultRefineToggleTitle);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(true);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });

          scope('when closing the refine modal', () => {
            Actions.clickRefineModalCloseButton();
            Expect.displayModal(false);
          });

          scope('when clicking on the view results button', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Actions.clickViewResultsButton();
            Expect.displayModal(false);
          });
        });
      });

      describe('when the search query does not return any facet values', () => {
        it('should enable the refine toggle button', () => {
          visitPage({}, true, false);
          addFacets();
          cy.wait(InterceptAliases.Search);

          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });
        });
      });
    });

    describe('when the hideSort property is set to true', () => {
      it('should enable the refine toggle button not display the sort component in the refine modal content', () => {
        visitPage({hideSort: true});
        addFacets();

        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(false);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });
        });
      });

      describe('when the search query does not return any facet values', () => {
        it('should enable the refine toggle button', () => {
          visitPage({}, true, false);
          addFacets();
          cy.wait(InterceptAliases.Search);

          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });
        });
      });
    });

    describe('when there is no results', () => {
      it('should disable the refine toggle component', () => {
        visitPage({}, false);
        addFacets();
        cy.wait(InterceptAliases.Search);

        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(true);
        });
      });
    });
  });

  describe('when facets without inputs are used in the search interface', () => {
    describe('when using default options', () => {
      it('should render the refine toggle component', () => {
        visitPage();
        addFacetsWithoutInputs();
        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.refineToggleTitleContains(defaultRefineToggleTitle);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(true);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });

          scope('when closing the refine modal', () => {
            Actions.clickRefineModalCloseButton();
            Expect.displayModal(false);
          });

          scope('when clicking on the view results button', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Actions.clickViewResultsButton();
            Expect.displayModal(false);
          });
        });
      });

      describe('when the search query does not return any facet values', () => {
        it('should enable the refine toggle button', () => {
          visitPage({}, true, false);
          addFacetsWithoutInputs();
          cy.wait(InterceptAliases.Search);

          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });
        });
      });
    });

    describe('when the hideSort property is set to true', () => {
      it('should enable the refine toggle button and not display the sort component in the refine modal content', () => {
        visitPage({hideSort: true}, true, true);
        addFacetsWithoutInputs();

        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(false);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });
        });
      });

      describe('when the search query does not return any facet values', () => {
        it('should disable the refine toggle button', () => {
          visitPage({hideSort: true}, true, false);
          addFacetsWithoutInputs();
          cy.wait(InterceptAliases.Search);

          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(true);
          });
        });
      });
    });

    describe('when there is no results', () => {
      it('should disable the refine toggle component', () => {
        visitPage({}, false);
        addFacetsWithoutInputs();
        cy.wait(InterceptAliases.Search);

        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(true);
        });
      });
    });
  });

  describe('when the fullScreen property is set to true', () => {
    it('should open the refine modal in full screen', () => {
      visitPage({
        fullScreen: true,
      });

      cy.wait(InterceptAliases.Search).then((interception) => {
        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(false);
        });

        scope('when opening the refine modal', () => {
          Actions.clickRefineButton();
          Expect.displayModal(true);
          Expect.displayModalFullScreen(true);
          Expect.displayRefineModalTitle(true);
          Expect.refineModalTitleContains(customRefineModalTitle);
          Expect.displayModalContent(true);
          Expect.displaySort(true);
          Expect.displayModalFooter(true);
          Expect.displayViewResultsButton(true);
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });
      });
    });
  });

  describe('when using a custom refine toggle title', () => {
    it('should have the correct title', () => {
      visitPage({
        title: customRefineToggleTitle,
      });
      cy.wait(InterceptAliases.Search);

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.refineToggleTitleContains(customRefineToggleTitle);
        Expect.displayRefineToggleIcon(true);
      });
    });
  });

  const facetTypes = ['Category', 'Timeframe', 'Numeric', 'Default'];

  facetTypes.forEach((facetType) => {
    describe(`when filters are selected from a ${facetType.toLowerCase()} facet`, () => {
      it('should display the correct filters count in the filters count badge', () => {
        visitPage();
        addFacets();

        cy.wait(InterceptAliases.Search).then((interception) => {
          scope('when loading the page', () => {
            Expect.displayRefineToggle(true);
            Expect.displayRefineToggleIcon(true);
            Expect.displayModal(false);
            Expect.refineToggleContains(customRefineToggleLabel);
            Expect.displayFiltersCountBadge(false);
            Expect.refineToggleDisabled(false);
          });

          scope('when opening the refine modal', () => {
            Actions.clickRefineButton();
            Expect.displayModal(true);
            Expect.displayModalFullScreen(false);
            Expect.displayRefineModalTitle(true);
            Expect.refineModalTitleContains(customRefineModalTitle);
            Expect.displayModalContent(true);
            Expect.displaySort(true);
            Expect.displayModalFooter(true);
            Expect.displayViewResultsButton(true);
            Expect.viewResultsButtonContains(
              viewResultsLabel(interception.response?.body.totalCount)
            );
          });

          scope('when selecting filters from a standard facet', () => {
            Actions[`click${facetType}FacetExpandButton`]();
            Actions[`click${facetType}FacetFirstOption`]();
          });

          scope('when closing the refine modal', () => {
            Actions.clickRefineModalCloseButton();
            Expect.displayFiltersCountBadge(true);
            Expect.filtersCountBadgeContains(1);
          });

          scope('when clearing filters', () => {
            Actions.clickRefineButton();
            Actions.clickClearAllFilters();
            Actions.clickRefineModalCloseButton();
            Expect.displayFiltersCountBadge(false);
          });
        });
      });
    });
  });

  describe('when filters from multiple facets are selected in the refine modal', () => {
    it('should display the correct filters count in filters count badge', () => {
      visitPage();
      addFacets();

      cy.wait(InterceptAliases.Search).then((interception) => {
        scope('when loading the page', () => {
          Expect.displayRefineToggle(true);
          Expect.displayRefineToggleIcon(true);
          Expect.displayModal(false);
          Expect.refineToggleContains(customRefineToggleLabel);
          Expect.displayFiltersCountBadge(false);
          Expect.refineToggleDisabled(false);
        });

        scope('when opening the refine modal', () => {
          Actions.clickRefineButton();
          Expect.displayModal(true);
          Expect.displayModalFullScreen(false);
          Expect.displayRefineModalTitle(true);
          Expect.refineModalTitleContains(customRefineModalTitle);
          Expect.displayModalContent(true);
          Expect.displaySort(true);
          Expect.displayModalFooter(true);
          Expect.displayViewResultsButton(true);
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });

        scope('when selecting filters', () => {
          Actions.clickDefaultFacetExpandButton();
          Actions.clickDefaultFacetFirstOption();
          Actions.clickTimeframeFacetExpandButton();
          Actions.clickTimeframeFacetFirstOption();
        });

        scope('when closing the refine modal', () => {
          Actions.clickRefineModalCloseButton();
          Expect.displayFiltersCountBadge(true);
          Expect.filtersCountBadgeContains(2);
        });

        scope('when clearing one filter', () => {
          Actions.clickRefineButton();
          Actions.clickFacetClearFilters();
          Actions.clickRefineModalCloseButton();
          Expect.displayFiltersCountBadge(true);
          Expect.filtersCountBadgeContains(1);
        });

        scope('when clearing all filters', () => {
          Actions.clickRefineButton();
          Actions.clickClearAllFilters();
          Actions.clickRefineModalCloseButton();
          Expect.displayFiltersCountBadge(false);
        });
      });
    });
  });
});
