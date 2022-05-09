import {should} from '../common-selectors';

import {
  RefineToggleSelector,
  RefineToggleSelectors,
} from './refine-toggle-selectors';

function refineToggleSelector(selector: RefineToggleSelector) {
  return {
    displayRefineButton: (display: boolean) => {
      selector
        .refineButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine button`);
    },

    displayRefineButtonIcon: (display: boolean) => {
      selector
        .refineButtonIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the refine button icon`);
    },

    refineButtonIconContains: (iconName: string) => {
      selector
        .refineButtonIcon()
        .find('svg')
        .invoke('attr', 'data-key')
        .should('contain', iconName)
        .logDetail(`the icon in refine button should contain "${iconName}"`);
    },

    refineButtonContains: (label: string) => {
      selector
        .refineButton()
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
        .logDetail(`${should(display)} display the modal`);
    },

    displayModalFullScreen: (fullScreen: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(fullScreen ? 'have.class' : 'not.have.class', 'full-screen')
        .should(fullScreen ? 'not.have.class' : 'have.class', 'part-screen')
        .logDetail(`${should(fullScreen)} display the modal on full screen`);
    },

    displayModalContent: (display: boolean) => {
      selector
        .modalContent()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the modal content`);
    },

    displayModalFooter: (display: boolean) => {
      selector
        .modalFooter()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the modal footer`);
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
          )} display the sort component inside the modal content`
        );
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
  };
}

export const RefineToggleExpectations = {
  ...refineToggleSelector(RefineToggleSelectors),
};
