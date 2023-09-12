import {TestFixture} from '../../../../fixtures/test-fixture';
import {addFacet} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with custom-sort', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({
            field: 'filetype',
            'custom-sort': JSON.stringify(['txt', 'rssitem']),
          })
        )
        .init();
    });

    it('returns values sorted in the proper order', () => {
      FacetSelectors.valueLabel().eq(0).should('contain.text', 'txt');
      FacetSelectors.valueLabel().eq(1).should('contain.text', 'rssitem');
    });
  });
});
