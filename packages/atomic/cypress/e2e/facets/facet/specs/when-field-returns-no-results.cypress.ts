import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonAssertions from '../../../common-assertions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with an invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'nononono'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, true);
  });
});
