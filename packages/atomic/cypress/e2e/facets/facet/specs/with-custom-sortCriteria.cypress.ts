import {TestFixture} from '../../../../fixtures/test-fixture';
import {addFacet, field, label} from '../facet-actions';
import * as FacetAssertions from '../facet-assertions';

describe('Facet v1 Test Suites', () => {
  describe('with custom #sortCriteria, alphanumeric', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'alphanumeric'}))
        .init();
    });

    FacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with custom #sortCriteria, alphanumericDescending', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({field, label, 'sort-criteria': 'alphanumericDescending'})
        )
        .init();
    });

    FacetAssertions.assertValuesSortedAlphanumericallyDescending();
  });

  describe('with custom #sortCriteria, occurrences', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurrences();
  });
});
