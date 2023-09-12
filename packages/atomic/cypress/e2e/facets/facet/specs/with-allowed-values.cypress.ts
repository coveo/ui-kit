import {TestFixture} from '../../../../fixtures/test-fixture';
import {addFacet} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with allowed-values', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({
            field: 'objecttype',
            'allowed-values': JSON.stringify(['FAQ', 'File']),
          })
        )
        .init();
    });

    it('returns only allowed values', () => {
      FacetSelectors.values()
        .should('contain.text', 'FAQ')
        .should('contain.text', 'File')
        .should('not.contain.text', 'Message');
    });
  });
});
