import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from './facet-common-selectors';

export function baseFacetExpectations(selector: BaseFacetSelector) {
  return {
    labelContains: (label: string) => {
      it(`should have the label "${label}"`, () => {
        selector.label().contains(label);
      });
    },

    displayValues: (display: boolean) => {
      it(`${should(display)} display facet values`, () => {
        selector.values().should(display ? 'exist' : 'not.exist');
      });
    },

    displayClearButton: (display: boolean) => {
      it(`${should(display)} display a "Clear filter" button`, () => {
        selector.clearFilterButton().should(display ? 'exist' : 'not.exist');
      });
    },

    displayClearXFiltersButton: (numberOfActiveFacets: number) => {
      it(`should display a "Clear ${numberOfActiveFacets} filters" button`, () => {
        selector
          .clearMultipleFilterButton(numberOfActiveFacets)
          .should('exist');
      });
    },

    facetValueContains: (value: string) => {
      it(`should contain "${value}" facet value`, () => {
        selector.valueLabel().contains(value);
      });
    },

    displayCollapseButton: (display: boolean) => {
      it(`${should(display)} display the collapse button`, () => {
        selector.collapseButton().should(display ? 'be.visible' : 'not.exist');
      });
    },

    displayExpandButton: (display: boolean) => {
      it(`${should(display)} display the expand button`, () => {
        selector.expandButton().should(display ? 'be.visible' : 'not.exist');
      });
    },

    logClearFacetValues: (field: string) => {
      it('should log the facet clear all to UA', () => {
        cy.wait(InterceptAliases.UA.Facet.ClearAll).then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'facetClearAll'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        });
      });
    },
  };
}

export function facetWithCheckboxExpectations(
  selector: FacetWithCheckboxSelector
) {
  return {
    numberOfSelectedCheckboxValues: (value: number) => {
      it(`should display ${value} selected checkbox values`, () => {
        selector.selectedCheckboxValue().should('have.length', value);
      });
    },

    numberOfIdleCheckboxValues: (value: number) => {
      it(`should display ${value} idle checkbox values`, () => {
        selector.idleCheckboxValue().should('have.length', value);
      });
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
            .selectedCheckboxValue()
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

export function facetWithLinkExpectatinos(selector: FacetWithLinkSelector) {
  return {
    hasCheckbox: (display: boolean) => {
      it(`${should(display)} display facet values with checkboxes`, () => {
        selector.checkbox().should(display ? 'be.visible' : 'not.exist');
      });
    },

    numberOfSelectedLinkValues: (value: number) => {
      it(`should display ${value} selected checkbox values`, () => {
        selector.selectedLinkValue().should('have.length', value);
      });
    },

    numberOfIdleLinkValues: (value: number) => {
      it(`should display ${value} idle checkbox values`, () => {
        selector.idleLinkValue().should('have.length', value);
      });
    },
  };
}

export function facetWithSearchExpectations(selector: FacetWithSearchSelector) {
  return {
    displaySearchInput: (display: boolean) => {
      it(`${should(display)} display the facet search input`, () => {
        selector.searchInput().should(display ? 'be.visible' : 'not.exist');
      });
    },

    displaySearchClearButton: (display: boolean) => {
      it(`${should(display)} display the facet search clear button`, () => {
        selector
          .searchClearButton()
          .should(display ? 'be.visible' : 'not.exist');
      });
    },

    highlightsResults: (query: string) => {
      it(`should highlight the results with the query "${query}"`, () => {
        selector.valueHighlight().each((element) => {
          const text = element.text().toLowerCase();
          expect(text).to.eq(query.toLowerCase());
        });
      });
    },

    searchInputEmpty: () => {
      it('the search input should be empty', () => {
        selector.searchInput().invoke('val').should('be.empty');
      });
    },

    displayMoreMatchesFound: (display: boolean) => {
      it(`${should(display)} display the "More matches for" label`, () => {
        selector.moreMatches().should(display ? 'be.visible' : 'not.exist');
      });
    },

    displayNoMatchesFound: (display: boolean) => {
      it(`${should(display)} display the "No matches found for" label`, () => {
        selector.noMatches().should(display ? 'be.visible' : 'not.exist');
      });
    },

    moreMatchesFoundContainsQuery: (query: string) => {
      it(`"More matches for" label should have the query ${query}`, () => {
        selector.moreMatches().contains(query);
      });
    },

    noMatchesFoundContainsQuery: (query: string) => {
      it(`"No matches found for" label should have the query ${query}`, () => {
        selector.noMatches().contains(query);
      });
    },

    logFacetSearch: (field: string) => {
      it('should log the facet search to UA', () => {
        cy.wait(InterceptAliases.UA.Facet.Search).then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        });
      });
    },
  };
}

export function facetWithShowMoreLessExpectations(
  selector: FacetWithShowMoreLessSelector
) {
  return {
    displayShowMoreButton: (display: boolean) => {
      it(`${should(display)} display a "Show more" button`, () => {
        selector.showMoreButton().should(display ? 'be.visible' : 'not.exist');
      });
    },

    displayShowLessButton: (display: boolean) => {
      it(`${should(display)} display a "Show less" button`, () => {
        selector.showLessButton().should(display ? 'be.visible' : 'not.exist');
      });
    },
  };
}
