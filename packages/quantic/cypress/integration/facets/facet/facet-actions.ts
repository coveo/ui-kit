import {BaseFacetSelector} from '../facet-common-selectors';

const valueCheckbox = 'input[type="checkbox"]';
const valueLink = '.facet__value-text';

export function checkFirstValue(selector: BaseFacetSelector) {
  selector.values().first().find(valueCheckbox).check({force: true});
}

export function checkLastValue(selector: BaseFacetSelector) {
  selector.values().last().find(valueCheckbox).check({force: true});
}

export function selectFirstLinkValue(selector: BaseFacetSelector) {
  selector.values().first().find(valueLink).check({force: true});
}

export function selectLastLinkValue(selector: BaseFacetSelector) {
  selector.values().last().find(valueLink).check({force: true});
}
