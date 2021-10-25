import {InterceptAliases} from '../../../page-objects/search';
import {
  CategoryFacetSelectors,
  AllFacetSelectors,
} from './category-facet-selectors';
const hierarchicalField = 'geographicalhierarchy';
const categoryFacetExpectations = (selector: AllFacetSelectors) => {
  return {
    isRendered: (accessible: boolean) => {
      selector.get().should(accessible ? 'exist' : 'not.exist');
    },
    displayLabel: (display: boolean) => {
      selector.label().should(display ? 'exist' : 'not.exist');
    },
    displayPlaceholder: (display: boolean) => {
      selector.placeholder().should(display ? 'exist' : 'not.exist');
    },
    displayFacetCount: (display: boolean) => {
      selector.facetCount().should(display ? 'exist' : 'not.exist');
    },
    numberOfChildValues: (value: number) => {
      selector.childValueOption().should('have.length', value);
    },
    firstChildContains: (value: string) => {
      selector.childValueOption().first().contains(value);
    },
    numberOfParentValues: (value: number) => {
      selector
        .activeParentValueOption()
        .should(value > 0 ? 'be.visible' : 'not.exist');
      if (value <= 1) {
        selector.parentValueOption().should('not.exist');
        return;
      }
      selector.parentValueOption().should('have.length', value - 1);
    },
    displaySearchInput: (display: boolean) => {
      selector.searchInput().should(display ? 'exist' : 'not.exist');
    },
    displaySearchClearInput: (display: boolean) => {
      selector.searchClearButton().should(display ? 'exist' : 'not.exist');
    },
    numberOfValues: (value: number) => {
      selector.values().should('have.length', value);
    },
    parentValueLabel: (value: string) => {
      selector.parentValueLabel().first().should('contain', value);
    },
    urlHashContains: (path: string[]) => {
      const categoryFacetListInUrl = path.join(',');
      const urlHash = `#cf[${hierarchicalField}]=${encodeURI(
        categoryFacetListInUrl
      )}`;
      cy.url().should('include', urlHash);
    },
    noUrlHash: () => {
      cy.url().should('not.include', '#cf');
    },
    displayNoMatchesFound: (display: boolean) => {
      selector.noMatches().should(display ? 'exist' : 'not.exist');
    },
    displayMoreMatchesFound: (display: boolean) => {
      selector.moreMatches().should(display ? 'exist' : 'not.exist');
    },
    moreMatchesFoundContainsQuery: (query: string) => {
      selector.moreMatches().contains(query);
    },
    highlightsResults: (query: string) => {
      selector.valueHighlight().each((element) => {
        const text = element.text().toLowerCase();
        expect(text).to.eq(query.toLowerCase());
      });
    },
    displaySearchResultsPath: () => {
      selector.searchResultPath().should('exist');
    },
    searchResults: (value: number) => {
      selector.searchResults().should('have.length', value);
    },
    logCategoryFacetSelected: (path: string[]) => {
      cy.wait(InterceptAliases.UA.Facet.Select).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.customData).to.have.property(
          'facetValue',
          path.join(';')
        );
        expect(analyticsBody.customData).to.have.property(
          'facetField',
          hierarchicalField
        );

        expect(analyticsBody.facetState[0]).to.have.property(
          'state',
          'selected'
        );
        expect(analyticsBody.facetState[0]).to.have.property(
          'field',
          hierarchicalField
        );
        expect(analyticsBody.facetState[0]).to.have.property(
          'facetType',
          'hierarchical'
        );
      });
    },
    logCategoryFacetSearch: (field: string) => {
      cy.wait(InterceptAliases.UA.Facet.Search).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
        expect(analyticsBody.customData).to.have.property('facetField', field);
      });
    },
    logCategoryFacetClearAll: (field: string) => {
      cy.wait(InterceptAliases.UA.Facet.ClearAll).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
        expect(analyticsBody.customData).to.have.property('facetField', field);
      });
    },
    logCategoryFacetLoad: () => {
      cy.wait(InterceptAliases.UA.Facet.Load).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
      });
    },
  };
};
export const CategoryFacetExpectations = {
  ...categoryFacetExpectations(CategoryFacetSelectors),
};
