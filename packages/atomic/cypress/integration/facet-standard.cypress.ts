import {getAnalyticsAt, getApiRequestBodyAt} from '../utils/network';
import {setUpPage, shouldRenderErrorComponent} from '../utils/setupComponent';
import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
  createBreadcrumbShadowAlias,
} from './facet-selectors';

const facetProp = {
  field: 'author',
  label: 'Authors',
};

const compareAlphanumericalValues = (valueA: string, valueB: string) => {
  if (valueA.toLowerCase() < valueB.toLowerCase()) {
    return -1;
  }
  if (valueA.toLowerCase() > valueB.toLowerCase()) {
    return 1;
  }
  return 0;
};

const sortCriteriaOption = {
  automatic: 'automatic',
  alphanumeric: 'alphanumeric',
  occurrences: 'occurrences',
  score: 'score',
};

function setupPager(field: string, label: string, option?: string) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>
     <atomic-facet field="${field}" label="${label}" ${option}></atomic-facet>`
  );
}

function componentLoaded(label: string) {
  cy.get(FacetSelectors.facetStandard).should('be.visible');
  cy.get('@facetShadow').find('div:nth-child(1)').should('contain.text', label);
  cy.checkA11y(FacetSelectors.facetStandard);
}

function validateNumberofValue(totalNumber: number) {
  cy.wait(200);
  cy.get('@facet_ul').find('li').its('length').should('eq', totalNumber);
}

async function facetValueShouldDisplayInBreadcrumb(
  facetValueSelector: string,
  valueDisplayInBreadcrumbSelector: string
) {
  cy.get(facetValueSelector)
    .find('label span:nth-child(1)')
    .invoke('text')
    .then((text) => {
      cy.get('@breadcrumbFacet')
        .find(valueDisplayInBreadcrumbSelector)
        .should('be.visible')
        .contains(text);
    });
}

async function validateBasicFacetFunctionality(
  selector: string,
  field: string
) {
  cy.get(selector).click();
  cy.get(selector).find(FacetSelectors.checkbox).should('be.checked');
  const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
    .body;
  expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
  expect(analyticsBody.customData).to.have.property('facetField', field);
  expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
  expect(analyticsBody.facetState[0]).to.have.property('field', field);
}
async function getTextOfAllElements(selector: string) {
  return new Promise((resolve) => {
    cy.get(selector).then((elems) => {
      const originalValues = [...elems].map((el: any) => el.textContent.trim());
      resolve(originalValues);
    });
  });
}

function isArraySorted(originalValues: string[], expectedSort: boolean) {
  const sortedValues = originalValues
    .concat()
    .sort(compareAlphanumericalValues);
  if (expectedSort === true) {
    expect(originalValues).to.eql(sortedValues);
  } else {
    expect(originalValues).not.to.eql(sortedValues);
  }
}

async function facetSortShouldApply(
  sortOption: string,
  requestBodyOrder: number
) {
  const requestBodyFacets = (
    await getApiRequestBodyAt('@coveoSearch', requestBodyOrder)
  ).facets;
  expect(requestBodyFacets[0]).to.have.property('sortCriteria', sortOption);
}

function replaceSpaceInURLhash(text: string) {
  return text.replace(/ /g, '%20');
}

describe('Standard Facet', () => {
  beforeEach(() => {
    setupPager(facetProp.field, facetProp.label);
    createAliasShadow(facetProp.field);
    createAliasFacetUL(facetProp.field);
    cy.get('@facet_ul').find('li:nth-child(1)').as('facetLi_1');
    cy.get('@facet_ul').find('li:nth-child(2)').as('facetLi_2');
    cy.get('@facet_ul').find('label span:nth-child(1)').as('listFacetValue');
  });

  describe('When page is loaded', () => {
    it('Facet should load, pass accessibility test and have correct label', () => {
      componentLoaded(facetProp.label);
    });

    it('Facet should contain Searchbox, ShowMore button and 10 facetValue', () => {
      cy.get('@facetShadow')
        .find(FacetSelectors.facetSearchbox)
        .should('be.visible');
      cy.get('@facetShadow')
        .find(FacetSelectors.showMoreButton)
        .should('be.visible');
      validateNumberofValue(10);
    });

    it('FacetValue list should not in Alphanumeric order', async () => {
      const originalValues = await getTextOfAllElements('@listFacetValue');
      isArraySorted(originalValues as string[], false);
    });
  });

  describe('When select 1 facetValue checkbox', () => {
    it('Should active checkbox and log UA', async () => {
      await validateBasicFacetFunctionality('@facetLi_1', facetProp.field);
    });

    it('Should trigger breadcrumb and display correctly', () => {
      cy.get('@facetLi_1').click();
      createBreadcrumbShadowAlias();
      cy.get('@breadcrumbClearAllFilter').should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        '@facetLi_1',
        'ul li:nth-child(2) button'
      );
    });

    it('Should reflect selected facetValue on URL', async () => {
      cy.get('@facetLi_1')
        .click()
        .find('label span:nth-child(1)')
        .invoke('text')
        .then((txt) => {
          const urlHash = `#f[author]=${replaceSpaceInURLhash(txt)}`;
          cy.url().should('include', urlHash);
        });
    });
  });

  describe('When deselect 1 selected facetValue checkbox', () => {
    it('should clear the checkbox and log UA', async () => {
      cy.get('@facetLi_1').click();
      cy.wait(500);
      cy.get('@facetLi_1').click();
      cy.get('@facetLi_1')
        .find(FacetSelectors.checkbox)
        .should('not.be.checked');
      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 2)).request
        .body;
      expect(analyticsBody).to.have.property('actionCause', 'facetDeselect');
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        facetProp.field
      );
    });
  });

  describe('When select 2 facetValue checkboxes', () => {
    it('Two checkboxes should selected and should record UA correctly', async () => {
      cy.get('@facetLi_1').click();
      cy.get('@facetLi_2').click();
      cy.get('@facetLi_1').find(FacetSelectors.checkbox).should('be.checked');
      cy.get('@facetLi_2').find(FacetSelectors.checkbox).should('be.checked');
      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 2)).request
        .body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.facetState).to.have.lengthOf(2);
    });

    it('Should trigger breadcrumb and display correctly', () => {
      cy.get('@facetLi_1').click();
      cy.get('@facetLi_2').click();
      createBreadcrumbShadowAlias();
      cy.get('@breadcrumbClearAllFilter').should('be.visible');
      facetValueShouldDisplayInBreadcrumb(
        '@facetLi_1',
        'ul li:nth-child(2) button'
      );
      facetValueShouldDisplayInBreadcrumb(
        '@facetLi_2',
        'ul li:nth-child(3) button'
      );
    });

    it('Should reflect selected facetValue on URL', async () => {
      cy.get('@facetLi_1').click();
      cy.get('@facetLi_2').click();
      cy.get('@facetLi_1')
        .find('label span:nth-child(1)')
        .invoke('text')
        .then((txtFacet1) => {
          cy.get('@facetLi_2')
            .find('label span:nth-child(1)')
            .invoke('text')
            .then((txtFacet2) => {
              const urlHash = `#f[author]=${replaceSpaceInURLhash(
                `${txtFacet1},${txtFacet2}`
              )}`;
              cy.url().should('include', urlHash);
            });
        });
    });
  });

  describe('When click on ShowMore button', () => {
    it('Should display double NumberOfValue and ShowLessButton should be visible', () => {
      validateNumberofValue(10);
      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      validateNumberofValue(20);
      cy.get('@facetShadow')
        .find(FacetSelectors.showLessButton)
        .should('be.visible');
    });

    it('Should log UA', async () => {
      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
        .body;
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
    });

    it('Should sort facetValue in alphanumeric order', async () => {
      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      cy.wait(500);
      const originalValues = await getTextOfAllElements('@listFacetValue');
      isArraySorted(originalValues as string[], true);
    });
  });

  describe('When click on ShowLess button', () => {
    it('Should display original numberOfValue and ShowLessButton should not be visible', () => {
      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      validateNumberofValue(20);
      cy.get('@facetShadow').find(FacetSelectors.showLessButton).click();
      validateNumberofValue(10);
      cy.get('@facetShadow')
        .find(FacetSelectors.showLessButton)
        .should('not.exist');
    });

    it('Should log UA', async () => {
      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      cy.get('@facetShadow').find(FacetSelectors.showLessButton).click();
      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 2)).request
        .body;
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
    });
  });

  describe('When click ClearAll facet', () => {
    it('Should clear all checkboxes and log UA', async () => {
      cy.get('@facetLi_1').click();
      cy.get('@facetLi_2').click();
      cy.get('@facetShadow').find(FacetSelectors.clearAllButton).click();
      cy.get('@facetLi_1')
        .find(FacetSelectors.checkbox)
        .should('not.be.checked');
      cy.get('@facetLi_2')
        .find(FacetSelectors.checkbox)
        .should('not.be.checked');
      const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 3)).request
        .body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.facetState).to.have.lengthOf(0);
    });
  });
});

describe('Facet with no facetSearch, and numberOfValues is 5 ', () => {
  beforeEach(() => {
    setupPager(
      facetProp.field,
      facetProp.label,
      'enable-facet-search=false number-of-values=5'
    );
    createAliasShadow(facetProp.field);
    createAliasFacetUL(facetProp.field);
    cy.get('@facet_ul').find('li:nth-child(1)').as('facetLi_1');
    cy.get('@facet_ul').find('li:nth-child(2)').as('facetLi_2');
  });

  it('Facet should load without facet search and 5 facet values', async () => {
    componentLoaded(facetProp.label);
    cy.get('@facetShadow')
      .find(FacetSelectors.facetSearchbox)
      .should('not.exist');
    validateNumberofValue(5);
  });

  it('Should active checkbox and log UA', async () => {
    await validateBasicFacetFunctionality('@facetLi_1', facetProp.field);
  });
});

describe('Facet with different sort-criteria options', () => {
  it('Should using "automatic" sort for default setting', async () => {
    setupPager(facetProp.field, facetProp.label);
    await facetSortShouldApply(sortCriteriaOption.automatic, 0);
  });

  it('Should using "alphanumeric" sort for custom setting', async () => {
    setupPager(
      facetProp.field,
      facetProp.label,
      'sort-criteria="alphanumeric"'
    );
    await facetSortShouldApply(sortCriteriaOption.alphanumeric, 0);
  });

  it('Should using "occurrences" sort for custom setting', async () => {
    setupPager(facetProp.field, facetProp.label, 'sort-criteria="occurrences"');
    await facetSortShouldApply(sortCriteriaOption.occurrences, 0);
  });

  it('Should using "score" sort for custom setting', async () => {
    setupPager(facetProp.field, facetProp.label, 'sort-criteria="score"');
    await facetSortShouldApply(sortCriteriaOption.score, 0);
  });

  it('Should using "automatic" sort for custom setting', async () => {
    setupPager(facetProp.field, facetProp.label, 'sort-criteria="automatic"');
    await facetSortShouldApply(sortCriteriaOption.automatic, 0);
  });

  describe('Trigger ShowMore on facet with custom sort-criteria', () => {
    it('Should not change the sort order', async () => {
      setupPager(
        facetProp.field,
        facetProp.label,
        'sort-criteria="occurrences"'
      );
      createAliasShadow(facetProp.field);

      cy.get('@facetShadow').find(FacetSelectors.showMoreButton).click();
      await facetSortShouldApply(sortCriteriaOption.occurrences, 1);
    });
  });
});

describe('Facet with invalid options', () => {
  describe('Facet with invalid field', () => {
    it('Should render an error when field is invalid', () => {
      setupPager('@test', facetProp.label);
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });

    it.skip('Should not render when field returns no result', () => {
      setupPager('author2', facetProp.label);
    });
  });

  describe('Facet with invalid numberOfValues', () => {
    it('Should render an error when the prop is not in the list of numberOfValues', () => {
      setupPager(facetProp.field, facetProp.label, 'number-of-values=-5');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });

    it('Should render an error when the prop is not a number ', () => {
      setupPager(facetProp.field, facetProp.label, 'number-of-values="here"');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });
  });

  describe('Facet with invalid sort criteria', () => {
    it('Should render an error when the prop is not in the list of sortCriteria', () => {
      setupPager(facetProp.field, facetProp.label, 'sort-criteria=test');
      shouldRenderErrorComponent(FacetSelectors.facetStandard);
    });
  });
});

describe('Facet with custom delimitingCharacter', () => {
  beforeEach(() => {
    setupPager(facetProp.field, facetProp.label, 'delimiting-character=","');
  });
  it('Should generate Facet correctly');
});
