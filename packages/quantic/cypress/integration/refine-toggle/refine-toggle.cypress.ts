import {configure} from '../../page-objects/configurator';

import {RefineToggleExpectations as Expect} from './refine-toggle-expectations';
import {RefineToggleActions as Actions} from './refine-toggle-actions';
import {scope} from '../../reporters/detailed-collector';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';

interface RefineToggleOptions {
  fullScreen: boolean;
  buttonLabel: string;
  hideIcon: boolean;
  hideSort: boolean;
}

const viewResultsLabel = (value: number) => {
  return `View results (${new Intl.NumberFormat().format(value)})`;
};

const customRefineModalTitle = 'Custom Title';
const defaultRefineToggleLabel = 'Sort & Filters';
const customRefineToggleLabel = 'Custom Label';

describe('quantic-refine-toggle', () => {
  const pageUrl = 's/quantic-refine-toggle';

  function visitPage(options: Partial<RefineToggleOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the refine toggle component', () => {
      visitPage();

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.displayRefineToggleIcon(true);
        Expect.displayModal(false);
        Expect.refineToggleContains(defaultRefineToggleLabel);
        Expect.displayFiltersCountBadge(false);
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
        cy.wait(InterceptAliases.Search).then((interception) => {
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });
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

  describe('when customizing the refine toggle button', () => {
    it('should render the custom label and hide the icon of the toggle button', () => {
      visitPage({
        hideIcon: true,
        buttonLabel: customRefineToggleLabel,
      });

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.displayRefineToggleIcon(false);
        Expect.displayModal(false);
        Expect.refineToggleContains(customRefineToggleLabel);
        Expect.displayFiltersCountBadge(false);
      });
    });
  });

  describe('when the fullScreen property is set to true', () => {
    it('should open the refine modal in full screen', () => {
      visitPage({
        fullScreen: true,
      });

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.displayRefineToggleIcon(true);
        Expect.displayModal(false);
        Expect.refineToggleContains(defaultRefineToggleLabel);
        Expect.displayFiltersCountBadge(false);
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
        cy.wait(InterceptAliases.Search).then((interception) => {
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });
      });
    });
  });

  describe('when the hideSort property is set to true', () => {
    it('should not display the sort component in the refine modal content', () => {
      visitPage({
        hideSort: true,
      });

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.displayRefineToggleIcon(true);
        Expect.displayModal(false);
        Expect.refineToggleContains(defaultRefineToggleLabel);
        Expect.displayFiltersCountBadge(false);
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
        cy.wait(InterceptAliases.Search).then((interception) => {
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });
      });
    });
  });

  describe('when filters are selected in the refine modal', () => {
    it('should display the correct filters count in filters count badge', () => {
      visitPage();

      scope('when loading the page', () => {
        Expect.displayRefineToggle(true);
        Expect.displayRefineToggleIcon(true);
        Expect.displayModal(false);
        Expect.refineToggleContains(defaultRefineToggleLabel);
        Expect.displayFiltersCountBadge(false);
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
        cy.wait(InterceptAliases.Search).then((interception) => {
          Expect.viewResultsButtonContains(
            viewResultsLabel(interception.response?.body.totalCount)
          );
        });
      });

      scope('when selecting filters', () => {
        Actions.clickFacetExpandButton();
        Actions.clickTimeframeFacetExpandButton();
        Actions.clickFacetFirstOption();
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
