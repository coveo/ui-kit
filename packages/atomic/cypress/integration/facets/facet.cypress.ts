import {
  setUpPage,
  shouldRenderErrorComponent,
} from '../../utils/setupComponent';
import {doSortAlphanumeric} from '../../utils/componentUtils';

import {
  validateFacetComponentLoaded,
  validateFacetNumberofValueEqual,
  assertBasicFacetFunctionality,
  assertSortCriteria,
  facetValueShouldDisplayInBreadcrumb,
  assertDeselectFacet,
  assertClearAllFacet,
} from './facet-utils';

import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
  createBreadcrumbShadowAlias,
  FacetAlias,
  BreadcrumbAlias,
} from './facet-selectors';

interface FacetProps {
  field: string;
  label: string;
  'sort-criteria'?: string;
}

const facetProp: FacetProps = {
  field: 'author',
  label: 'Authors',
};

const sortCriteriaOption = {
  automatic: 'automatic',
  alphanumeric: 'alphanumeric',
  occurrences: 'occurrences',
  score: 'score',
};

function setupFacet(field: string, label: string, option?: string) {
  setUpPage(`
  <atomic-breadcrumb-manager></atomic-breadcrumb-manager>
  <atomic-facet field="${field}" label="${label}" ${option}></atomic-facet>`);
}

describe('Standard Facet', () => {
  beforeEach(() => {
    setupFacet(facetProp.field, facetProp.label);
    createAliasShadow(facetProp.field);
    createAliasFacetUL(facetProp.field);
  });

  describe('When page is loaded', () => {
    it.skip('Facet should load, pass accessibility test and have correct label', () => {
      validateFacetComponentLoaded(facetProp.label);
    });

    it.skip('Facet should contain Searchbox, ShowMore button and 10 facetValue', () => {
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.facetSearchbox)
        .should('be.visible');
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .should('be.visible');
      validateFacetNumberofValueEqual(10);
    });

    it.skip('FacetValue list should not in Alphanumeric order', () => {
      cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
        (originalValues) => {
          expect(originalValues).not.to.eql(doSortAlphanumeric(originalValues));
        }
      );
    });
  });

  describe('When select 1 facetValue checkbox', () => {
    it.skip('Should active checkbox and log UA', () => {
      assertBasicFacetFunctionality(
        FacetAlias.facetFirstValueLabel,
        facetProp.field
      );
    });

    it.skip('Should trigger breadcrumb and display correctly', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbClearAllFilter).should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        FacetAlias.facetFirstValueLabel,
        '.breadcrumb:nth-child(1) button span'
      );
    });

    it.skip('Should reflect selected facetValue on URL', () => {
      cy.get(FacetAlias.facetFirstValueLabel)
        .click()
        .find('label span:nth-child(1)')
        .invoke('text')
        .then((txt) => {
          const urlHash = `#f[author]=${encodeURI(txt)}`;
          cy.url().should('include', urlHash);
        });
    });
  });

  describe('When deselect 1 selected facetValue checkbox', () => {
    it.skip('should clear the checkbox and log UA', () => {
      assertDeselectFacet(facetProp.field);
    });
  });

  describe('When select 2 facetValue checkboxes', () => {
    it.skip('Two checkboxes should selected and should record UA correctly', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      cy.get(FacetAlias.facetSecondValueLabel).click();
      cy.get(FacetAlias.facetFirstValueLabel)
        .find(FacetSelectors.checkbox)
        .should('be.checked');
      cy.get(FacetAlias.facetSecondValueLabel)
        .find(FacetSelectors.checkbox)
        .should('be.checked');
      cy.getAnalyticsAt('@coveoAnalytics', 2).then((analyticsBody) => {
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.facetState).to.have.lengthOf(2);
      });
    });

    it.skip('Should trigger breadcrumb and display correctly', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      cy.get(FacetAlias.facetSecondValueLabel).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbClearAllFilter).should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        FacetAlias.facetFirstValueLabel,
        '.breadcrumb:nth-child(1) button span'
      );
      facetValueShouldDisplayInBreadcrumb(
        FacetAlias.facetSecondValueLabel,
        '.breadcrumb:nth-child(2) button span'
      );
    });

    it.skip('Should reflect selected facetValue on URL', () => {
      cy.get(FacetAlias.facetFirstValueLabel).click();
      cy.get(FacetAlias.facetSecondValueLabel).click();
      cy.get(FacetAlias.facetFirstValueLabel)
        .find('label span:nth-child(1)')
        .invoke('text')
        .then((txtFacet1) => {
          cy.get(FacetAlias.facetSecondValueLabel)
            .find('label span:nth-child(1)')
            .invoke('text')
            .then((txtFacet2) => {
              const urlHash = `#f[author]=${encodeURI(
                `${txtFacet1},${txtFacet2}`
              )}`;
              console.log(urlHash);
              cy.url().should('include', urlHash);
            });
        });
    });
  });

  describe('When click on ShowMore button', () => {
    it.skip('Should display double NumberOfValue and ShowLessButton should be visible', () => {
      validateFacetNumberofValueEqual(10);
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      validateFacetNumberofValueEqual(20);
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showLessButton)
        .should('be.visible');
    });

    it.skip('Should log UA', () => {
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      cy.getAnalyticsAt('@coveoAnalytics', 1).then((analyticsBody) => {
        expect(analyticsBody).to.have.property(
          'eventValue',
          'showMoreFacetResults'
        );
      });
    });

    it.skip('Should sort facetValue in alphanumeric order', () => {
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      cy.wait(500);
      cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
        (originalValues) => {
          expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
        }
      );
    });
  });

  describe('When click on ShowLess button', () => {
    it.skip('Should display original numberOfValue and ShowLessButton should not be visible', () => {
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      validateFacetNumberofValueEqual(20);
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showLessButton)
        .click();
      validateFacetNumberofValueEqual(10);
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showLessButton)
        .should('not.exist');
    });

    it.skip('Should log UA', () => {
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showLessButton)
        .click();
      cy.getAnalyticsAt('@coveoAnalytics', 2).then((analyticsBody) => {
        expect(analyticsBody).to.have.property(
          'eventValue',
          'showLessFacetResults'
        );
      });
    });
  });

  describe('When click ClearAll facet', () => {
    it.skip('Should clear all checkboxes and log UA', () => {
      assertClearAllFacet();
    });
  });
});

describe('Facet with no facetSearch, and numberOfValues is 5 ', () => {
  beforeEach(() => {
    setupFacet(
      facetProp.field,
      facetProp.label,
      'enable-facet-search=false number-of-values=5'
    );
    createAliasShadow(facetProp.field);
    createAliasFacetUL(facetProp.field);
  });

  it.skip('Facet should load without facet search and 5 facet values', () => {
    validateFacetComponentLoaded(facetProp.label);
    cy.get(FacetAlias.facetShadow)
      .find(FacetSelectors.facetSearchbox)
      .should('not.exist');
    validateFacetNumberofValueEqual(5);
  });

  it.skip('Should active checkbox and log UA', () => {
    assertBasicFacetFunctionality(
      FacetAlias.facetFirstValueLabel,
      facetProp.field
    );
  });
});

describe('Facet with different sort-criteria options', () => {
  it.skip('Should using "automatic" sort for default setting', async () => {
    setupFacet(facetProp.field, facetProp.label);
    await assertSortCriteria(sortCriteriaOption.automatic, 0);
  });

  it.skip('Should using "alphanumeric" sort for custom setting', async () => {
    setupFacet(
      facetProp.field,
      facetProp.label,
      'sort-criteria="alphanumeric"'
    );
    await assertSortCriteria(sortCriteriaOption.alphanumeric, 0);
  });

  it.skip('Should using "occurrences" sort for custom setting', async () => {
    setupFacet(facetProp.field, facetProp.label, 'sort-criteria="occurrences"');
    await assertSortCriteria(sortCriteriaOption.occurrences, 0);
  });

  it.skip('Should using "score" sort for custom setting', async () => {
    setupFacet(facetProp.field, facetProp.label, 'sort-criteria="score"');
    await assertSortCriteria(sortCriteriaOption.score, 0);
  });

  it.skip('Should using "automatic" sort for custom setting', async () => {
    setupFacet(facetProp.field, facetProp.label, 'sort-criteria="automatic"');
    await assertSortCriteria(sortCriteriaOption.automatic, 0);
  });

  describe('Trigger ShowMore on a facet with sort-criteria other than "automatic"', () => {
    it.skip('Should not change the sort order', async () => {
      setupFacet(
        facetProp.field,
        facetProp.label,
        'sort-criteria="occurrences"'
      );
      createAliasShadow(facetProp.field);

      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.showMoreButton)
        .click();
      await assertSortCriteria(sortCriteriaOption.occurrences, 1);
    });
  });
});

describe('Facet with invalid options', () => {
  describe('Facet with invalid field', () => {
    it.skip('Should render an error when field is invalid', () => {
      setupFacet('@test', facetProp.label);
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });

    it.skip('Should not render when field returns no result', () => {
      setupFacet('author2', facetProp.label);
    });
  });

  describe('Facet with invalid numberOfValues', () => {
    it.skip('Should render an error when the prop is not in the list of numberOfValues', () => {
      setupFacet(facetProp.field, facetProp.label, 'number-of-values=-5');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });

    it.skip('Should render an error when the prop is not a number ', () => {
      setupFacet(facetProp.field, facetProp.label, 'number-of-values="here"');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });
  });

  describe('Facet with invalid sort criteria', () => {
    it.skip('Should render an error when the prop is not in the list of sortCriteria', () => {
      setupFacet(facetProp.field, facetProp.label, 'sort-criteria=test');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });
  });
});

describe('Facet with custom delimitingCharacter', () => {
  beforeEach(() => {
    setupFacet(facetProp.field, facetProp.label, 'delimiting-character=","');
  });
  it.skip('Should generate Facet correctly');
});
