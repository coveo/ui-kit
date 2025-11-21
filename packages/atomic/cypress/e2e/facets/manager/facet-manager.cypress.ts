import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {
  addFacetManagerWithStaticFacets,
  facetManagerComponent,
} from './facet-manager-actions';
import {
  assertFacetsNoCollapsedAttribute,
  assertHasNumberOfExpandedFacets,
} from './facet-manager-assertions';

describe('Facet Manager Test Suite', () => {
  it('should throw an error when collapseFacetsAfter property is invalid', () => {
    new TestFixture()
      .with(
        addFacetManagerWithStaticFacets({'collapse-facets-after': 'potato'})
      )
      .init();

    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(facetManagerComponent).shadow(),
      },
      true
    );
  });

  describe('with static facets only', () => {
    it('should only keep the first 4 facets expanded by default', () => {
      new TestFixture().with(addFacetManagerWithStaticFacets()).init();
      assertHasNumberOfExpandedFacets(4);
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      new TestFixture()
        .with(addFacetManagerWithStaticFacets({'collapse-facets-after': 1}))
        .init();
      assertHasNumberOfExpandedFacets(1);
    });

    it('should not set the is-collapsed attribute when the collapseFacetsAfter is -1', () => {
      new TestFixture()
        .with(addFacetManagerWithStaticFacets({'collapse-facets-after': -1}))
        .init();

      assertFacetsNoCollapsedAttribute();
    });
  });
});
