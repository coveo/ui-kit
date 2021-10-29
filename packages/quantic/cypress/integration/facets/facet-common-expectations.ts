import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {
  BaseFacetSelector,
  FacetWithValuesSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from './facet-common-selectors';

export function baseFacetExpectations(selector: BaseFacetSelector) {
  return {
    displayLabel: (display: boolean) => {
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the facet`);
    },

    labelContains: (label: string) => {
      selector
        .label()
        .contains(label)
        .logDetail(`should have the label "${label}"`);
    },

    displayValues: (display: boolean) => {
      selector
        .values()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display facet values`);
    },

    displayPlaceholder: (display: boolean) => {
      selector
        .placeholder()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the facet placeholder`);
    },

    displayClearButton: (display: boolean) => {
      selector
        .clearFilterButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display a clear filter button`);
    },

    clearFilterContains: (value: string) => {
      selector
        .clearFilterButton()
        .should('contain', value)
        .logDetail(`should display a clear filter button with text "${value}"`);
    },

    facetValueContains: (value: string) => {
      selector
        .valueLabel()
        .contains(value)
        .logDetail(`should contain "${value}" facet value`);
    },

    displayCollapseButton: (display: boolean) => {
      selector
        .collapseButton()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the collapse button`);
    },

    displayExpandButton: (display: boolean) => {
      selector
        .expandButton()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the expand button`);
    },

    numberOfValues: (value: number) => {
      selector
        .values()
        .should('have.length', value)
        .logDetail(`should display ${value} facet values`);
    },

    facetValuesEqual: (responseValuesAlias: string) => {
      cy.get(responseValuesAlias)
        .then((responseValues) => {
          selector
            .valueLabel()
            .should('have.length', responseValues.length)
            .then((elements) => {
              return Cypress.$.makeArray(elements).map(
                (element) => element.innerText
              );
            })
            .should('deep.equal', responseValues);
        })
        .logDetail('should contain facet values in specific order');
    },

    logClearFacetValues: (field: string) => {
      cy.wait(InterceptAliases.UA.Facet.ClearAll)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'facetClearAll'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        })
        .logDetail('should log the facet clear all to UA');
    },
  };
}

export function facetWithValuesExpectations(selector: FacetWithValuesSelector) {
  return {
    selectedValuesContain: (value: string) => {
      selector
        .selectedValue()
        .should('contain', value)
        .logDetail(`${value} should be selected`);
    },

    numberOfSelectedCheckboxValues: (value: number) => {
      selector
        .selectedCheckbox()
        .should('have.length', value)
        .logDetail(`should display ${value} selected checkbox values`);
    },

    numberOfIdleCheckboxValues: (value: number) => {
      selector
        .idleCheckbox()
        .should('have.length', value)
        .logDetail(`should display ${value} idle checkbox values`);
    },

    hasCheckbox: (display: boolean) => {
      selector
        .checkbox()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display facet values with checkboxes`);
    },

    numberOfSelectedLinkValues: (value: number) => {
      selector
        .selectedValue()
        .should('have.length', value)
        .logDetail(`should display ${value} selected link values`);
    },

    numberOfIdleLinkValues: (value: number) => {
      selector
        .idleValue()
        .should('have.length', value)
        .logDetail(`should display ${value} idle link values`);
    },

    logFacetSelect: (field: string, selectedValueIndex: number) => {
      it('should log the facet select results to UA ', () => {
        cy.wait(InterceptAliases.UA.Facet.Select).then((intercept) => {
          const analyticsBody = intercept.request.body;
          expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
          expect(analyticsBody.facetState[0]).to.have.property(
            'state',
            'selected'
          );
          expect(analyticsBody.facetState[0]).to.have.property('field', field);

          selector
            .selectedValue()
            .eq(selectedValueIndex)
            .invoke('text')
            .then((txt: string) => {
              expect(analyticsBody.customData).to.have.property(
                'facetValue',
                txt
              );
            });
        });
      });
    },
  };
}

export function facetWithSearchExpectations(selector: FacetWithSearchSelector) {
  return {
    displaySearchInput: (display: boolean) => {
      selector
        .searchInput()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the facet search input`);
    },

    displaySearchClearButton: (display: boolean) => {
      selector
        .searchClearButton()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the facet search clear button`);
    },

    highlightsResults: (query: string) => {
      selector
        .valueHighlight()
        .each((element) => {
          const text = element.text().toLowerCase();
          expect(text).to.eq(query.toLowerCase());
        })
        .logDetail(`should highlight the results with the query "${query}"`);
    },

    searchInputEmpty: () => {
      selector
        .searchInput()
        .invoke('val')
        .should('be.empty')
        .logDetail('the search input should be empty');
    },

    displayMoreMatchesFound: (display: boolean) => {
      selector
        .moreMatches()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display the "More matches for" label`);
    },

    displayNoMatchesFound: (display: boolean) => {
      selector
        .noMatches()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(
          `${should(display)} display the "No matches found for" label`
        );
    },

    moreMatchesFoundContainsQuery: (query: string) => {
      selector
        .moreMatches()
        .contains(query)
        .logDetail(`"More matches for" label should have the query ${query}`);
    },

    noMatchesFoundContainsQuery: (query: string) => {
      selector
        .noMatches()
        .contains(query)
        .logDetail(
          `"No matches found for" label should have the query ${query}`
        );
    },

    logFacetSearch: (field: string) => {
      cy.wait(InterceptAliases.UA.Facet.Search)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        })
        .logDetail('should log the facet search to UA');
    },
  };
}

export function facetWithShowMoreLessExpectations(
  selector: FacetWithShowMoreLessSelector
) {
  return {
    displayShowMoreButton: (display: boolean) => {
      selector
        .showMoreButton()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display a "Show more" button`);
    },

    displayShowLessButton: (display: boolean) => {
      selector
        .showLessButton()
        .should(display ? 'be.visible' : 'not.exist')
        .logDetail(`${should(display)} display a "Show less" button`);
    },
  };
}
