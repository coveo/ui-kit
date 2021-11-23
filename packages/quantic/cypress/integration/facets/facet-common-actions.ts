import {
  BaseFacetSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from './facet-common-selectors';

const valueCheckbox = 'input[type="checkbox"]';
const valueLink = '.facet__value-text';

export const baseFacetActions = (selector: BaseFacetSelector) => {
  return {
    checkValueAt: (index: number) => {
      selector
        .values()
        .eq(index)
        .find(valueCheckbox)
        .check({force: true})
        .logAction(`when checking the value at index ${index} `);
    },
    clickClearFilter: () => {
      selector.clearFilterButton().click();
    },
    checkFirstValue: () => {
      selector
        .values()
        .first()
        .find(valueCheckbox)
        .check({force: true})
        .logAction('When checking the first value in the facet');
    },
    checkLastValue: () => {
      selector.values().last().find(valueCheckbox).check({force: true});
    },
    selectFirstLinkValue: () => {
      selector
        .values()
        .first()
        .find(valueLink)
        .click({force: true})
        .logAction('When selecting the first value in the facet');
    },
    selectLastLinkValue: () => {
      selector
        .values()
        .last()
        .find(valueLink)
        .click({force: true})
        .logAction('When selecting the last value in the facet');
    },
    clickCollapseButton: () => {
      selector.collapseButton().click();
    },
    clickExpandButton: () => {
      selector.expandButton().click();
    },
  };
};

export const facetWithSearchActions = (selector: FacetWithSearchSelector) => {
  return {
    typeQueryInSearchInput: (query: string) => {
      selector.searchInput().type(query);
    },
    clickSearchClearButton: () => {
      selector.searchClearButton().click();
    },
  };
};

export const facetWithShowMoreLessActions = (
  selector: FacetWithShowMoreLessSelector
) => {
  return {
    clickShowMoreButton: () => {
      selector
        .showMoreButton()
        .click()
        .logAction('when clicking the "show more" button');
    },
    clickShowLessButton: () => {
      selector.showLessButton().click();
    },
  };
};
