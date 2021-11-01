import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {SearchExpectations} from '../../search-expectations';
import {
  baseFacetExpectations,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {
  CategoryFacetSelectors,
  AllFacetSelectors,
} from './category-facet-selectors';
const hierarchicalField = 'geographicalhierarchy';
const categoryFacetExpectations = (selector: AllFacetSelectors) => {
  return {
    displayFacetCount: (display: boolean) => {
      selector
        .facetCount()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the facet count`);
    },
    numberOfChildValues: (value: number) => {
      selector
        .childValueOption()
        .should('have.length', value)
        .logDetail(`should display ${value} child values`);
    },
    firstChildContains: (value: string) => {
      selector
        .childValueOption()
        .first()
        .contains(value)
        .logDetail(`should contain "${value}" child value`);
    },
    numberOfParentValues: (value: number) => {
      selector
        .activeParentValueOption()
        .should(value > 0 ? 'be.visible' : 'not.exist')
        .logDetail(
          `${should(value > 0)} display the active parent value option`
        );
      if (value <= 1) {
        selector
          .parentValueOption()
          .should('not.exist')
          .logDetail('should not display parent value option');
        return;
      }
      selector
        .parentValueOption()
        .should('have.length', value - 1)
        .logDetail(`should display ${value} parent values`);
    },
    parentValueLabel: (value: string) => {
      selector
        .parentValueLabel()
        .first()
        .should('contain', value)
        .logDetail(`should contain "${value}" parent value`);
    },
    urlHashContains: (path: string[]) => {
      const categoryFacetListInUrl = path.join(',');
      const urlHash = `#cf[${hierarchicalField}]=${encodeURI(
        categoryFacetListInUrl
      )}`;
      cy.url()
        .should('include', urlHash)
        .logDetail('should contain path in the url');
    },
    noUrlHash: () => {
      cy.url().should('not.include', '#cf');
    },
    displaySearchResultsPath: () => {
      selector.searchResultPath().should('exist');
    },
    searchResultsPathContains: (value: string) => {
      selector.searchResultPath().contains(value);
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
  };
};
export const CategoryFacetExpectations = {
  ...categoryFacetExpectations(CategoryFacetSelectors),
  ...baseFacetExpectations(CategoryFacetSelectors),
  ...facetWithShowMoreLessExpectations(CategoryFacetSelectors),
  ...facetWithSearchExpectations(CategoryFacetSelectors),
  search: {
    ...SearchExpectations,
  },
};
