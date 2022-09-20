import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {addFacetManager, facetManagerComponent} from './facet-manager-actions';
import {
  assertFacetsNoCollapsedAttribute,
  assertHasNumberOfExpandedFacets,
} from './facet-manager-assertions';

describe('Facet Manager Test Suite', () => {
  it('by default, should only keep the first 4 facets expanded', () => {
    new TestFixture().with(addFacetManager()).init();
    assertHasNumberOfExpandedFacets(4);
  });

  it('should respect the collapseFacetsAfter prop when set', () => {
    new TestFixture()
      .with(addFacetManager({'collapse-facets-after': 1}))
      .init();
    assertHasNumberOfExpandedFacets(1);
  });

  it('when the collapseFacetsAfter is "-1", should not set the is-collapsed attribute', () => {
    new TestFixture()
      .with(addFacetManager({'collapse-facets-after': -1}))
      .init();
    assertFacetsNoCollapsedAttribute();
  });

  it('should throw an error when collapseFacetsAfter property is invalid', () => {
    new TestFixture()
      .with(addFacetManager({'collapse-facets-after': 'potato'}))
      .init();
    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(facetManagerComponent).shadow(),
      },
      true
    );
  });
});
