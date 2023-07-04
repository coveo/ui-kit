import {should} from '../../common-selectors';
import {
  RefineToggleSelector,
  RefineToggleSelectors,
} from './refine-toggle-selectors';

function refineToggleSelector(selector: RefineToggleSelector) {
  return {
    displayRefineToggle: (display: boolean) => {
      selector
        .refineToggle()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine toggle`);
    },

    refineToggleTitleContains: (title: string) => {
      selector
        .refineToggle()
        .invoke('attr', 'title')
        .should('eq', title)
        .logDetail(`The refine toggle title should contain ${title}`);
    },

    displayRefineToggleIcon: (display: boolean) => {
      selector
        .refineToggleIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine toggle icon`);
    },

    refineToggleContains: (label: string) => {
      selector
        .refineToggle()
        .contains(label)
        .logDetail(`The refine button should contain "${label}"`);
    },

    displayRefineModalTitle: (display: boolean) => {
      selector
        .refineModalTitle()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine modal title`);
    },

    refineModalTitleContains: (label: string) => {
      selector
        .refineModalTitle()
        .contains(label)
        .logDetail(`The refine modal title should contain "${label}"`);
    },

    displayModal: (display: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the refine modal`);
    },

    displayModalFullScreen: (fullScreen: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(fullScreen ? 'have.class' : 'not.have.class', 'full-screen')
        .should(fullScreen ? 'not.have.class' : 'have.class', 'part-screen')
        .logDetail(
          `${should(fullScreen)} display the modal on full screen mode`
        );
    },

    displayModalContent: (display: boolean) => {
      selector
        .modalContent()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the refine modal content`);
    },

    displayModalFooter: (display: boolean) => {
      selector
        .modalFooter()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the refine modal footer`);
    },

    displayViewResultsButton: (display: boolean) => {
      selector
        .viewResultsButton()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the view results button`);
    },

    viewResultsButtonContains: (label: string) => {
      selector
        .viewResultsButton()
        .contains(label)
        .logDetail(`The view results should contain "${label}"`);
    },

    displaySort: (display: boolean) => {
      selector
        .sort()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the sort component inside the refine modal content`
        );
    },

    displayFacetManager: (display = true) => {
      selector
        .facetManager()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} the facet manager`);
    },

    displayFiltersCountBadge: (display: boolean) => {
      selector
        .filtersCountBadge()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the filters count badge`);
    },

    filtersCountBadgeContains: (count: number) => {
      selector
        .filtersCountBadge()
        .contains(`${count}`)
        .logDetail(`The filters count badge should contain "${count}"`);
    },

    refineToggleDisabled: (disabled: boolean) => {
      selector
        .refineToggle()
        .invoke('attr', 'disabled')
        .should(disabled ? 'exist' : 'not.exist')
        .logDetail(`The refine button ${should(disabled)} be disabled`);
    },
    displayRefineModalEmptyMessage: (display: boolean) => {
      selector
        .refineModalEmptyMessage()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine modal empty message`);
    },
  };
}

export const RefineToggleExpectations = {
  ...refineToggleSelector(RefineToggleSelectors),
};
