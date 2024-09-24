import {FacetValue} from '@coveo/headless';
import {SearchInterface, TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  pressLabelButton,
  pressShowLess,
  pressShowMore,
  selectIdleCheckboxValueAt,
  typeFacetSearchQuery,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet, field, label, defaultNumberOfValues} from './facet-actions';
import * as FacetAssertions from './facet-assertions';
import {facetComponent, FacetSelectors} from './facet-selectors';

// This is the second half of the facet test suite. It was split in two to speed up the test execution.
describe('Facet Test Suite 2', () => {
  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore(sortCriteria?: string) {
      new TestFixture()
        .with(
          addFacet({
            field,
            label,
            ...(sortCriteria && {'sort-criteria': sortCriteria}),
          })
        )
        .init();
      pressShowMore(FacetSelectors);
    }

    describe('verify rendering', () => {
      beforeEach(() => setupSelectShowMore('automatic'));

      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      FacetAssertions.assertValuesSortedAlphanumerically();
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues * 2
      );
      CommonFacetAssertions.assertFocusCheckboxValue(FacetSelectors, 0);
    });

    describe("when the sort order isn't automatic", () => {
      beforeEach(() => setupSelectShowMore('alphanumeric'));

      CommonFacetAssertions.assertFocusCheckboxValue(
        FacetSelectors,
        defaultNumberOfValues
      );
    });

    describe('verify analytics', () => {
      beforeEach(() => setupSelectShowMore());

      FacetAssertions.assertLogFacetShowMore(field);
      it('should include analytics in the v2 call', async () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          const analyticsBody = firstSearch.request.body.analytics;
          expect(analyticsBody).to.have.property('eventType', 'facet');
          expect(analyticsBody).to.have.property(
            'eventValue',
            'showMoreFacetResults'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        });
      });
    });

    describe('when there\'s no more "Show more" button', () => {
      function setupRepeatShowMore() {
        new TestFixture().with(addFacet({field: 'month', label})).init();
        FacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }
      beforeEach(setupRepeatShowMore);

      describe('verify rendering', () => {
        CommonFacetAssertions.assertDisplayShowMoreButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      });
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        pressShowLess(FacetSelectors);
      }
      beforeEach(setupSelectShowLess);

      describe('verify rendering', () => {
        CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
        CommonFacetAssertions.assertDisplayShowLessButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          FacetSelectors,
          defaultNumberOfValues
        );
      });

      describe('verify analytics', () => {
        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture().with(addFacet({field, label})).init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      pressLabelButton(FacetSelectors, true);
    }

    beforeEach(setupSelectLabelCollapse);

    CommonAssertions.assertAccessibility(facetComponent);
    CommonAssertions.assertContainsComponentError(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayValues(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayShowMoreButton(
      FacetSelectors,
      false,
      false
    );
    CommonFacetAssertions.assertDisplayShowLessButton(
      FacetSelectors,
      false,
      false
    );
    CommonFacetAssertions.assertLabelContains(FacetSelectors, label);

    describe('when selecting the label button to expand', () => {
      function setupSelectLabelExpand() {
        FacetSelectors.labelButton().click();
      }

      beforeEach(setupSelectLabelExpand);

      CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayValues(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    });
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addFacet({field, label, 'number-of-values': numberOfValues}))
        .init();
    }

    beforeEach(setupCustomNumberOfValues);

    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      numberOfValues
    );
    CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, false);

    describe('when selecting the "Show More" button', () => {
      beforeEach(() => {
        pressShowMore(FacetSelectors);
      });

      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        numberOfValues * 2
      );
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
    });
  });

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

  describe('with #resultsMustMatch set to "allValues"', () => {
    function setupSelectCheckboxValue() {
      new TestFixture()
        .with(addFacet({field, label, 'results-must-match': 'allValues'}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
    }

    beforeEach(() => {
      setupSelectCheckboxValue();
    });

    it('should set resultsMustMatch to `allValues`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((search) => {
        expect(search.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'allValues'
        );
      });
    });
  });

  describe('with #resultsMustMatch set to default value', () => {
    function setupSelectCheckboxValue() {
      new TestFixture().with(addFacet({field, label})).init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
    }

    beforeEach(() => {
      setupSelectCheckboxValue();
    });

    it('should set resultsMustMatch to `atLeastOneValue`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((search) => {
        expect(search.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'atLeastOneValue'
        );
      });
    });
  });

  describe('when defining a value caption', () => {
    const caption = 'nicecaption';
    beforeEach(() => {
      const fixture = new TestFixture().with(addFacet({field, label})).init();
      cy.get(`@${fixture.elementAliases.SearchInterface}`).then(($si) => {
        const searchInterfaceComponent = $si.get()[0] as SearchInterface;

        searchInterfaceComponent.i18n.addResource(
          'en',
          `caption-${field}`,
          'People',
          caption
        );
      });

      typeFacetSearchQuery(FacetSelectors, caption, true);
    });

    CommonFacetAssertions.assertFirstValueContains(FacetSelectors, caption);
  });

  describe('with #withSearch to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'with-search': 'false'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
  });

  describe('with #withSearch to true and expanded (moreValuesAvailable=false)', () => {
    const setup = (numValues: number) =>
      new TestFixture()
        .with(addFacet({field, label, 'with-search': 'true'}))
        .withCustomResponse((response) => {
          response.facets[0].values = [...Array(numValues).keys()].map((i) => {
            return {value: i.toString(), numberOfResults: 1};
          }) as FacetValue[];
          response.facets[0].moreValuesAvailable = false;
        })
        .init();

    it('with less than 8 values, it should not display the search input', () => {
      setup(3);
      CommonFacetAssertions.assertDisplaySearchInputWithoutIt(
        FacetSelectors,
        false
      );
    });

    it('with exactly 8 values, it should not display the search input', () => {
      setup(8);
      CommonFacetAssertions.assertDisplaySearchInputWithoutIt(
        FacetSelectors,
        false
      );
    });

    it('with more than 8 values, it should display the search input', () => {
      setup(10);
      CommonFacetAssertions.assertDisplaySearchInputWithoutIt(
        FacetSelectors,
        true
      );
    });
  });

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

  describe('with an invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'nononono'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, true);
  });

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
