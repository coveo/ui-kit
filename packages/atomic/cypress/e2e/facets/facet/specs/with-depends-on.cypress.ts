import {TestFixture} from '../../../../fixtures/test-fixture';
import * as CommonAssertions from '../../../common-assertions';
import {
  selectIdleCheckboxValueAt,
  typeFacetSearchQuery,
} from '../../facet-common-actions';
import {addFacet, field} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with depends-on', () => {
    describe('as a dependent & parent', () => {
      const facetId = 'abc';
      const parentFacetId = 'def';
      const parentField = 'filetype';
      const expectedValue = 'txt';
      beforeEach(() => {
        new TestFixture()
          .with(
            addFacet({
              'facet-id': facetId,
              field,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      it('should control display of both parent and child properly', () => {
        FacetSelectors.withId(facetId).wrapper().should('not.exist');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          FacetSelectors.withId(parentFacetId),
          expectedValue,
          true
        );
        selectIdleCheckboxValueAt(FacetSelectors.withId(parentFacetId), 0);
        FacetSelectors.withId(facetId).wrapper().should('be.visible');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });
    });

    describe('with two dependencies', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addFacet({
              'facet-id': 'ghi',
              field,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        FacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
