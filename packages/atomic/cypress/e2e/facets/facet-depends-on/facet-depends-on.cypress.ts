import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addColorFacet,
  selectIdleBoxValueAt,
} from '../color-facet/color-facet-actions';
import * as ColorFacetAssertions from '../color-facet/color-facet-assertions';
import {ColorFacetSelectors} from '../color-facet/color-facet-selectors';
import {pressClearButton, typeFacetSearchQuery} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import * as FacetAssertions from '../facet/facet-assertions';
import {FacetSelectors} from '../facet/facet-selectors';
import {addNumericFacet} from '../numeric-facet/numeric-facet-actions';
import {NumericFacetSelectors} from '../numeric-facet/numeric-facet-selectors';

const level0FacetId = 'abc';
const level1FacetIdA = 'def';
const level1FacetIdB = 'ghi';
const level2FacetId = 'jkl';

const level0FacetExpectedValue = 'YouTubeVideo';
const level0FacetUnexpectedValue = 'doc';
const level1FacetAPossibleValue = 'BBC News';

const maximumNumberOfLevel0Values = 6;

const addThreeLevelDependantFacet = () => (fixture: TestFixture) => {
  fixture
    .with(
      addColorFacet({
        'facet-id': level0FacetId,
        field: 'filetype',
        'number-of-values': maximumNumberOfLevel0Values,
      })
    )
    .with(
      addFacet({
        'facet-id': level1FacetIdA,
        field: 'author',
        [`depends-on-${level0FacetId}`]: level0FacetExpectedValue,
      })
    )
    .with(
      addNumericFacet({
        'facet-id': level1FacetIdB,
        field: 'ytlikecount',
        [`depends-on-${level0FacetId}`]: level0FacetExpectedValue,
      })
    )
    .with(
      addNumericFacet({
        'facet-id': level2FacetId,
        field: 'ytlikecount',
        [`depends-on-${level1FacetIdA}`]: '',
      })
    );
};

function assertFacetsDisplayed(numberOfFacetsDisplayed: number) {
  CommonFacetAssertions.assertDisplayFacet(
    ColorFacetSelectors.withId(level0FacetId),
    numberOfFacetsDisplayed >= 1
  );
  CommonFacetAssertions.assertDisplayFacet(
    FacetSelectors.withId(level1FacetIdA),
    numberOfFacetsDisplayed >= 2
  );
  CommonFacetAssertions.assertDisplayFacet(
    NumericFacetSelectors.withId(level1FacetIdB),
    numberOfFacetsDisplayed >= 3
  );
  CommonFacetAssertions.assertDisplayFacet(
    NumericFacetSelectors.withId(level2FacetId),
    numberOfFacetsDisplayed >= 4
  );
}

describe('Facet DependsOn Test Suites', () => {
  describe('with reflectStateInUrl', () => {
    const hashToDisplayFacets = (
      selectLevel0: boolean,
      selectLevel1: boolean
    ) => {
      const values: string[] = [];
      if (selectLevel0) {
        values.push(`f-${level0FacetId}=${level0FacetExpectedValue}`);
      }
      if (selectLevel1) {
        values.push(`f-${level1FacetIdA}=${level1FacetAPossibleValue}`);
      }
      return values.join('&');
    };

    describe('with no fulfilled dependency', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addThreeLevelDependantFacet())
          .withHash('')
          .init();
      });

      assertFacetsDisplayed(1);
    });

    describe('with a fulfilled two-level dependency in the hash', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addThreeLevelDependantFacet())
          .withHash(hashToDisplayFacets(true, false))
          .init();
      });

      assertFacetsDisplayed(3);
    });

    describe('when deselecting a parent facet', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addThreeLevelDependantFacet())
          .withHash(hashToDisplayFacets(true, true))
          .init();
        pressClearButton(ColorFacetSelectors.withId(level0FacetId));
      });

      FacetAssertions.assertLogFacetClearAll(level0FacetId);

      describe('then pressing the browser back button', () => {
        beforeEach(() => {
          cy.go('back');
        });

        assertFacetsDisplayed(4);

        it('should not have a duplicate history state', () => {
          cy.go('back');
          cy.location('pathname').should('eq', '/');
        });
      });
    });

    describe('with a fulfilled three-level dependency in the hash', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addThreeLevelDependantFacet())
          .withHash(hashToDisplayFacets(true, true))
          .init();
      });

      assertFacetsDisplayed(4);

      describe('when deselecting the root of the dependency tree', () => {
        beforeEach(() => {
          pressClearButton(ColorFacetSelectors.withId(level0FacetId));
        });

        assertFacetsDisplayed(1);
        ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
        ColorFacetAssertions.assertNumberOfIdleBoxValues(
          maximumNumberOfLevel0Values
        );
      });
    });

    describe('with an invalid state in the hash', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addThreeLevelDependantFacet())
          .withHash(hashToDisplayFacets(false, true))
          .init();
      });

      assertFacetsDisplayed(1);
    });
  });

  describe('without reflectStateInUrl', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addThreeLevelDependantFacet())
        .withoutStateInUrl()
        .init();
    });

    assertFacetsDisplayed(1);

    describe('when selecting an unrelated value in the level 0 facet', () => {
      beforeEach(() => {
        const level0Selectors = ColorFacetSelectors.withId(level0FacetId);
        typeFacetSearchQuery(level0Selectors, level0FacetUnexpectedValue, true);
        selectIdleBoxValueAt(0);
      });

      assertFacetsDisplayed(1);
    });

    describe('when selecting the dependended-on value in the level 0 facet', () => {
      beforeEach(() => {
        const level0Selectors = ColorFacetSelectors.withId(level0FacetId);
        typeFacetSearchQuery(level0Selectors, level0FacetExpectedValue, true);
        selectIdleBoxValueAt(0);
      });

      assertFacetsDisplayed(3);
    });
  });
});
