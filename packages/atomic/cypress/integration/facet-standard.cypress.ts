import {stringify} from 'querystring';
import {getAnalyticsAt} from '../utils/network';
import {
  setUpPage,
  injectComponent,
  shouldRenderErrorComponent,
} from '../utils/setupComponent';
import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
} from './facet-selectors';

interface facetUA {
  actionCause: string;
  customData: {
    facetField: string;
    facetValue: string;
  };
}

async function validateFacetUA(xhrOrder: number, expectedResult: facetUA) {
  const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', xhrOrder))
    .request.body;
  const customDataBody = analyticsBody.customData;
  expect(analyticsBody).to.have.property(
    'actionCause',
    expectedResult.actionCause
  );
  expect(customDataBody).to.have.property(
    'facetField',
    expectedResult.customData.facetField
  );
  expect(customDataBody).to.have.property(
    'facetValue',
    expectedResult.customData.facetValue
  );
}

function setupPager(field: string, label: string) {
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>
     <atomic-facet field="${field}" label="${label}"></atomic-facet>`
  );
}

function componentLoaded(label: string) {
  cy.get(FacetSelectors.facetStandard).should('be.visible');
  cy.get('@facetShadow').find('div:nth-child(1)').should('contain.text', label);
  cy.checkA11y(FacetSelectors.facetStandard);
}

function validateNumberofValue(totalNumber: number) {
  cy.get('@facet_ul').find('li').its('length').should('eq', totalNumber);
}

describe('Standard Facet test suites', () => {
  const facetProp = {
    field: 'author',
    label: 'Authors',
  };

  beforeEach(() => {
    setupPager(facetProp.field, facetProp.label);
    createAliasShadow(facetProp.field);
    createAliasFacetUL(facetProp.field);
    cy.get('@facet_ul').find('li:nth-child(1)').as('facetLi_1');
    cy.get('@facet_ul').find('li:nth-child(2)').as('facetLi_2');
  });

  describe('When page is loaded', () => {
    it('Facet should load, pass accessibility test and have correct label', () => {
      componentLoaded(facetProp.label);
    });

    it('Facet should contain ShowMore button and 10 facetValue', () => {
      cy.get('@facetShadow')
        .find(FacetSelectors.showMoreButton)
        .should('be.visible');
      validateNumberofValue(10);
    });
  });

  describe('When select 1 facetValue checkbox', () => {
    it('Should trigger new filter and log UA', async () => {
      cy.get('@facetLi_1').click();
      const ua: facetUA = {
        actionCause: 'facetSelect',
        customData: {
          facetField: 'author',
          facetValue: 'Simon Genier (admin)',
        },
      };
      await validateFacetUA(1, ua);
    });
  });

  describe('When deselect 1 selected facetValue checkbox', () => {
    it('should clear the filer and log UA', async () => {
      cy.get('@facetLi_1').click();
      cy.wait(500);
      cy.get('@facetLi_1').click();
      const ua: facetUA = {
        actionCause: 'facetDeselect',
        customData: {
          facetField: 'author',
          facetValue: 'Simon Genier (admin)',
        },
      };
      await validateFacetUA(2, ua);
    });
  });

  describe('When select 2 facetValue checkboxes', () => {
    it('Two checkboxes should selected and Should record 2 UA events');
  });
});
