import {BaseFacetSelector} from '../facet-common-selectors';

export function expectFacetValueContains(
  selector: BaseFacetSelector,
  value: string
) {
  it(`should contain "${value}" facet value`, () => {
    selector.valueLabel().contains(value);
  });
}
