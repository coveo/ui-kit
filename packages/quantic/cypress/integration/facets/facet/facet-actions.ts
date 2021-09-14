import {BaseFacetSelector} from '../facet-common-selectors';

const valueCheckbox = 'input[type="checkbox"]';

export function checkFirstValue(selector: BaseFacetSelector) {
  selector.values().first().find(valueCheckbox).check({force: true});
}

export function checkLastValue(selector: BaseFacetSelector) {
  selector.values().last().find(valueCheckbox).check({force: true});
}
