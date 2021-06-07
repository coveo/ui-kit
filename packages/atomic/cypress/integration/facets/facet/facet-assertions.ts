import {RangeFacetRangeAlgorithm} from '@coveo/headless';
import {doSortAlphanumeric} from '../../../utils/componentUtils';
import {RouteAlias} from '../../../utils/setupComponent';
import {BreadcrumbSelector} from '../../breadcrumb-manager-selectors';
import {ComponentErrorSelectors} from '../../component-error-selectors';
import {
  selectShowMoreButton,
  setupFacet,
  should,
  facetField,
  facetLabel,
  convertFacetValueToAPIformat,
} from './facet-actions';
import {facetComponent, FacetSelector} from './facet-selectors';

export function assertAccessibility(facetComponent: string) {
  it('should pass accessibility tests', () => {
    cy.checkA11y(facetComponent);
  });
}

export function assertContainsLabel(
  label: string,
  field = facetField,
  type = facetComponent
) {
  it(`should contain "${label}" as its label`, () => {
    FacetSelector.label(field, type).should('contain.text', label);
  });
}

export function assertNonZeroFacetCount(
  field = facetField,
  type = facetComponent
) {
  it('should not render any Facet with zero facet count', () => {
    FacetSelector.valueCounts(field, type).as('facetAllValueCounts');
    cy.getTextOfAllElements('@facetAllValueCounts').then((counts) => {
      expect(counts).not.to.include('0');
    });
  });
}

export function assertDisplayFacetSearchbox(
  display: boolean,
  field = facetField,
  type = facetComponent
) {
  it('should contain facet searchbox', () => {
    FacetSelector.facetSearchBox(field, type).should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowMoreButton(
  display: boolean,
  field = facetField,
  type = facetComponent
) {
  it(`${should(display)} contain Show More button`, () => {
    FacetSelector.showMoreButton(field, type).should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowLessButton(
  display: boolean,
  field = facetField,
  type = facetComponent
) {
  it(`${should(display)} contain Show Less button`, () => {
    FacetSelector.showLessButton(field, type).should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertFacetNumberOfValueEqual(
  totalNumber: number,
  field = facetField,
  type = facetComponent
) {
  it(`should contain "${totalNumber}" facet values`, () => {
    FacetSelector.valueLabels(field, type)
      .its('length')
      .should('eq', totalNumber);
  });
}

export function assertFacetNumberOfValueGreaterThan(
  totalNumber: number,
  field = facetField,
  type = facetComponent
) {
  it(`should contain more than "${totalNumber}" facet values`, () => {
    FacetSelector.facetValues(field, type)
      .its('length')
      .should('be.gt', totalNumber);
  });
}

export function assertFacetValuesSortedAlphanumerically(state: boolean) {
  it(`Facet values ${should(state)} be in Alphanumeric order`, () => {
    FacetSelector.valueLabels().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      const sortedValues = doSortAlphanumeric(originalValues);
      state
        ? expect(originalValues).to.eql(sortedValues)
        : expect(originalValues).not.to.eql(sortedValues);
    });
  });
}

export function assertCheckboxDisplay(
  index: number,
  state: boolean,
  field = facetField,
  type = facetComponent
) {
  it(`Checkbox at the index ${index} ${should(state)} be chekced`, () => {
    FacetSelector.facetCheckboxAtIndex(index, field, type).should(
      state ? 'have.class' : 'not.have.class',
      'checked'
    );
  });
}

export function assertBreadcrumbDisplayFacetValueAtIndex(
  index = 0,
  label = facetLabel,
  field = facetField,
  type = facetComponent
) {
  it(`should trigger breadcrumb and display correctly facetValue at ${index} position`, () => {
    BreadcrumbSelector.breadcrumbClearAllFilter().should('be.visible');
    FacetSelector.facetValueLabelAtIndex(index, field, type)
      .invoke('text')
      .then((txt) => {
        BreadcrumbSelector.breadcrumbValueAtIndex(label, index)
          .should('be.visible')
          .contains(txt);
      });
  });
}

export function assertFacetValueOnUrl() {
  it('should reflected selected facetValue on Url', () => {
    FacetSelector.facetValueLabelAtIndex(0)
      .invoke('text')
      .then((txt) => {
        const urlHash = `#f[author]=${encodeURI(txt)}`;
        cy.url().should('include', urlHash);
      });
  });
}

export function assertMultipleSelectedFacetValueOnUrl() {
  it('should reflect multiple selected facetValues on URL', () => {
    FacetSelector.facetValueLabelAtIndex(0)
      .invoke('text')
      .then((fv1) => {
        FacetSelector.facetValueLabelAtIndex(1)
          .invoke('text')
          .then((fv2) => {
            const urlHash = `#f[author]=${encodeURI(`${fv1},${fv2}`)}`;
            cy.url().should('include', urlHash);
          });
      });
  });
}

export function assertAnalyticLogFacetSelect(
  field = facetField,
  type = facetComponent,
  index = 0
) {
  it('should log the facet select results to UA ', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      FacetSelector.facetValueLabelAtIndex(index, field, type)
        .invoke('text')
        .then((txt) => {
          txt = convertFacetValueToAPIformat(txt.trim(), type);
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertAnalyticLogFacetDeselect(field = facetField) {
  it('should log the facet deselect results to UA ', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetDeselect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertAnalyticLogMultipleFacetsSelect() {
  it('should log the 2nd facet select results to UA ', () => {
    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.facetState).to.have.lengthOf(2);
    });
  });
}

export function assertAnalyticLogShowMoreShowLess(button: string) {
  it(`should log the ${button} results to UA`, () => {
    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property(
        'eventValue',
        `${button}FacetResults`
      );
    });
  });
}

export function assertAnalyticLogClearAllFacets() {
  it('should log the clearAllFacets results to UA', () => {
    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.facetState).to.have.lengthOf(0);
    });
  });
}

export function assertFacetSortCriteria(sortOption: string) {
  describe(`Facet with "${sortOption}" sort-criteria`, () => {
    it(`should use "${sortOption}" sort for custom setting`, () => {
      setupFacet({attributes: `sort-criteria="${sortOption}"`});
      cy.wait(RouteAlias.search).then((intercept) => {
        const requestBody = intercept.request.body.facets[0];
        expect(requestBody).to.have.property('sortCriteria', sortOption);
      });
      sortOption === 'occurrences' ? selectShowMoreButton() : '';
      cy.wait(200);
    });

    sortOption === 'alphanumeric'
      ? assertFacetValuesSortedAlphanumerically(true)
      : '';

    sortOption === 'occurrences'
      ? assertFacetValuesSortedAlphanumerically(false)
      : '';
  });
}

export function assertDisplayFacet(
  display: boolean,
  field = facetField,
  type = facetComponent
) {
  it(`${should(display)} display the facet`, () => {
    FacetSelector.wrapper(field, type).should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertContainsComponentError(
  display: boolean,
  field = facetField,
  type = facetComponent
) {
  it(`${should(display)} display an error component`, () => {
    FacetSelector.shadow(field, type)
      .find(ComponentErrorSelectors.component)
      .should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertAnalyticLogFacetInInterfaceLoadEvent(field = facetField) {
  it('should include facetState in UA interfaceLoad event', () => {
    cy.wait('@coveoAnalytics').then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);
    });
  });
}

export function assertRenderPlaceHolder(
  field = facetField,
  type = facetComponent
) {
  it('should render a placeholder', () => {
    FacetSelector.facetPlaceHolder(field, type).should('be.visible');
  });
}
