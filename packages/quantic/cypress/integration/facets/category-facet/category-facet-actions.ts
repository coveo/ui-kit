import {CategoryFacetSelector} from './category-facet-selectors';

export function clickFirstValueOption(selector: CategoryFacetSelector) {
  selector.childValueOption().first().click({force: true});
}
