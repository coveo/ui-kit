import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonAssertions from '../../../common-assertions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('when field returns no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'notanactualfield', label}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, false);
  });
});
