import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('when no search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, true);
  });
});
