import {BaseFacetSelector} from '../facet-common-selectors';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

const valueCheckbox = 'input[type="checkbox"]';

export function checkFirstValue(selector: BaseFacetSelector) {
  selector.values().first().find(valueCheckbox).check({force: true});
}
const numericFacetActions = (selector: AllFacetSelectors) => {
  return {
    checkFirstValue() {
      selector.values().first().find(valueCheckbox).check({force: true});
    },
  };
};

export const NumericFacetActions = {
  ...numericFacetActions(NumericFacetSelectors),
};
