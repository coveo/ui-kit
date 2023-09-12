import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label, defaultNumberOfValues} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withHash(`f-${field}=Cervantes`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      defaultNumberOfValues - 1
    );
    CommonFacetAssertions.assertFirstValueContains(FacetSelectors, 'Cervantes');
  });
});
