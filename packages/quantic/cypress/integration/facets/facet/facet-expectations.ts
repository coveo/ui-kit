import {InterceptAliases} from '../../../page-objects/search';
import {BaseFacetSelector} from '../facet-common-selectors';
import {FacetSelectors} from './facet-selectors';

export function expectFacetValueContains(
  selector: BaseFacetSelector,
  value: string
) {
  it(`should contain "${value}" facet value`, () => {
    selector.valueLabel().contains(value);
  });
}

export function expectLogFacetSelect(
  field: string,
  selectedValueIndex: number
) {
  it('should log the facet select results to UA ', () => {
    cy.wait(InterceptAliases.UA.Facet.Select).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      FacetSelectors.selectedCheckboxValue()
        .eq(selectedValueIndex)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}
