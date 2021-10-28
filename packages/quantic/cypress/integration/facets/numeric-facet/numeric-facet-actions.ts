import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

const valueCheckbox = 'input[type="checkbox"]';
export const field = 'ytlikecount';

const numericFacetActions = (selector: AllFacetSelectors) => {
  return {
    checkValueAt: (index: number) => {
      selector.values().eq(index).find(valueCheckbox).check({force: true});
    },
    clickClearFilter: () => {
      selector.clearFilterButton().click();
    },
  };
};

export const NumericFacetActions = {
  ...numericFacetActions(NumericFacetSelectors),
};
