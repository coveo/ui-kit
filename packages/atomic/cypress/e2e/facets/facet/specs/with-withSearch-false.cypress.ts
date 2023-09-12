import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with #withSearch to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'with-search': 'false'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
  });
});
