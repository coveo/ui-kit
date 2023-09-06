import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {
  addFacetManagerWithAutomaticFacets,
  addFacetManagerWithBothTypesOfFacets,
  addFacetManagerWithStaticFacets,
  facetManagerComponent,
} from './facet-manager-actions';
import {
  assertFacetsNoCollapsedAttribute,
  assertHasNumberOfExpandedAutomaticFacets,
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

  describe('with automatic facets only', () => {
    it('should only keep the first 4 facets expanded by default', () => {
      new TestFixture().with(addFacetManagerWithAutomaticFacets()).init();
      assertHasNumberOfExpandedAutomaticFacets(4);
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      new TestFixture()
        .with(addFacetManagerWithAutomaticFacets({'collapse-facets-after': 1}))
        .init();
      assertHasNumberOfExpandedAutomaticFacets(1);
    });

    it('should disable the collapseFacetsAfter prop when set to -1', () => {
      new TestFixture()
        .with(addFacetManagerWithAutomaticFacets({'collapse-facets-after': -1}))
        .init();
      assertHasNumberOfExpandedAutomaticFacets(3);
    });
  });

  describe('with both types of facets', () => {
    it('should only keep the first 4 facets expanded by default', () => {
      new TestFixture().with(addFacetManagerWithBothTypesOfFacets()).init();
      assertHasNumberOfExpandedFacets(3);
      assertHasNumberOfExpandedAutomaticFacets(1);
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      new TestFixture()
        .with(
          addFacetManagerWithBothTypesOfFacets({'collapse-facets-after': 2})
        )
        .init();
      assertHasNumberOfExpandedFacets(2);
      assertHasNumberOfExpandedAutomaticFacets(0);
    });

    it('should disable the collapseFacetsAfter prop when set to -1', () => {
      new TestFixture()
        .with(
          addFacetManagerWithBothTypesOfFacets({'collapse-facets-after': -1})
        )
        .init();
      assertHasNumberOfExpandedAutomaticFacets(3);
      assertHasNumberOfExpandedAutomaticFacets(3);
    });
  });
});
