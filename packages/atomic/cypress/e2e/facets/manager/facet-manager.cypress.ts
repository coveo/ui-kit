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
  assertAutomaticFacetsNoCollapsedAttribute,
  assertFacetsNoCollapsedAttribute,
  assertHasNumberOfExpandedAutomaticFacets,
  assertHasNumberOfExpandedFacets,
} from './facet-manager-assertions';

describe('Facet Manager Test Suite', () => {
  const DEFAULT_COLLAPSE_FACETS_AFTER = 4;
  const MINUS_ONE_COLLAPSE_FACETS_AFTER = -1;
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
    it(`should only keep the first ${DEFAULT_COLLAPSE_FACETS_AFTER} facets expanded by default`, () => {
      new TestFixture().with(addFacetManagerWithStaticFacets()).init();
      assertHasNumberOfExpandedFacets(DEFAULT_COLLAPSE_FACETS_AFTER);
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      new TestFixture()
        .with(addFacetManagerWithStaticFacets({'collapse-facets-after': 1}))
        .init();
      assertHasNumberOfExpandedFacets(1);
    });

    it(`should not set the is-collapsed attribute when the collapseFacetsAfter is ${MINUS_ONE_COLLAPSE_FACETS_AFTER}`, () => {
      new TestFixture()
        .with(
          addFacetManagerWithStaticFacets({
            'collapse-facets-after': MINUS_ONE_COLLAPSE_FACETS_AFTER,
          })
        )
        .init();
      assertFacetsNoCollapsedAttribute();
    });
  });

  describe('with automatic facets only', () => {
    function setup({
      collapseFacetsAfter,
      generatorCollapseFacetsAfter,
    }: {
      collapseFacetsAfter?: number;
      generatorCollapseFacetsAfter?: number;
    }) {
      const facetManagerOptions: Record<string, number> = {};

      if (collapseFacetsAfter !== undefined) {
        facetManagerOptions['collapse-facets-after'] = collapseFacetsAfter;
      }

      if (generatorCollapseFacetsAfter !== undefined) {
        facetManagerOptions['generator-collapse-facets-after'] =
          generatorCollapseFacetsAfter;
      }

      const facetManager =
        addFacetManagerWithAutomaticFacets(facetManagerOptions);

      new TestFixture().with(facetManager).init();
    }

    it(`should only keep the first ${DEFAULT_COLLAPSE_FACETS_AFTER} facets expanded by default`, () => {
      setup({});
      assertHasNumberOfExpandedAutomaticFacets(DEFAULT_COLLAPSE_FACETS_AFTER);
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      setup({collapseFacetsAfter: 1});
      cy.wait(500);
      assertHasNumberOfExpandedAutomaticFacets(1);
    });

    it(`should not set the is-collapsed attribute when the collapseFacetsAfter is ${MINUS_ONE_COLLAPSE_FACETS_AFTER}`, () => {
      setup({collapseFacetsAfter: MINUS_ONE_COLLAPSE_FACETS_AFTER});
      cy.wait(500);
      assertAutomaticFacetsNoCollapsedAttribute();
    });

    it(`should override the generator's collapseFacetsAfter value when collapseFacetsAfter is ${MINUS_ONE_COLLAPSE_FACETS_AFTER}`, () => {
      setup({
        collapseFacetsAfter: MINUS_ONE_COLLAPSE_FACETS_AFTER,
        generatorCollapseFacetsAfter: 2,
      });
      cy.wait(500);
      assertAutomaticFacetsNoCollapsedAttribute();
    });

    it("should override the generator's collapseFacetsAfter prop when collapseFacetsAfter prop is set", () => {
      setup({collapseFacetsAfter: 1, generatorCollapseFacetsAfter: 2});
      cy.wait(500);
      assertHasNumberOfExpandedAutomaticFacets(1);
    });
  });

  describe('with both types of facets', () => {
    const collapsedStaticFacets = 3;
    const collapsedAutomaticFacets = 2;

    function setup({
      collapseFacetsAfter,
      generatorCollapseFacetsAfter,
    }: {
      collapseFacetsAfter?: number;
      generatorCollapseFacetsAfter?: number;
    }) {
      const facetManagerOptions: Record<string, number> = {};

      if (collapseFacetsAfter !== undefined) {
        facetManagerOptions['collapse-facets-after'] = collapseFacetsAfter;
      }

      if (generatorCollapseFacetsAfter !== undefined) {
        facetManagerOptions['generator-collapse-facets-after'] =
          generatorCollapseFacetsAfter;
      }

      const facetManager =
        addFacetManagerWithBothTypesOfFacets(facetManagerOptions);

      new TestFixture().with(facetManager).init();
    }

    // beforeEach(() => {
    //   new TestFixture()
    //     .with(
    //       addFacetManagerWithBothTypesOfFacets({
    //         'collapse-facets-after':
    //           collapsedStaticFacets + collapsedAutomaticFacets,
    //       })
    //     )
    //     .init();
    // });

    it(`should only keep the first ${DEFAULT_COLLAPSE_FACETS_AFTER} facets expanded by default`, () => {
      setup({});
      assertHasNumberOfExpandedAutomaticFacets(collapsedStaticFacets);
      assertHasNumberOfExpandedAutomaticFacets(
        DEFAULT_COLLAPSE_FACETS_AFTER - collapsedStaticFacets
      );
    });

    it('should respect the collapseFacetsAfter prop when set', () => {
      setup({collapseFacetsAfter: 5});
      cy.wait(500);
      assertHasNumberOfExpandedFacets(collapsedStaticFacets);
      assertHasNumberOfExpandedAutomaticFacets(collapsedAutomaticFacets);
    });

    it(`should not set the is-collapsed attribute when the collapseFacetsAfter is ${MINUS_ONE_COLLAPSE_FACETS_AFTER}`, () => {
      setup({collapseFacetsAfter: MINUS_ONE_COLLAPSE_FACETS_AFTER});
      cy.wait(500);
      assertFacetsNoCollapsedAttribute();
      assertAutomaticFacetsNoCollapsedAttribute();
    });

    it("should override the generator's collapseFacetsAfter prop when collapseFacetsAfter prop is set", () => {
      setup({collapseFacetsAfter: 5, generatorCollapseFacetsAfter: 4});
      cy.wait(500);
      assertHasNumberOfExpandedFacets(collapsedStaticFacets);
      assertHasNumberOfExpandedAutomaticFacets(collapsedAutomaticFacets);
    });
  });
});
