import {InterceptAliases} from '../../../page-objects/search';
import {SearchExpectations} from '../../search-expectations';
import {
  CategoryFacetSelectors,
  CategoryFacetSelector,
} from './category-facet-selectors';
const hierarchicalField = 'geographicalhierarchy';
const categoryFacetExpectations = (selector: CategoryFacetSelector) => {
  return {
    isAccesssible: (accesible: boolean) => {
      selector.get().should(accesible ? 'exist' : 'not.exist');
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
    numberOfParentValues: (value: number) => {
      selector.parentValueOption().should('have.length', value);
    },
    displaySearchInput: (display: boolean) => {
      selector.searchInput().should(display ? 'exist' : 'not.exist');
    },
    numberOfValues: (value: number) => {
      selector.values().should('have.length', value);
    },
    parentValueLabel: (value: string) => {
      selector.parentValueLabel().first().should('contain', value);
    },
    displayShowMoreButton: (display: boolean) => {
      selector.showMoreButton().should(display ? 'exist' : 'not.exist');
    },
    displayShowLessButton: (display: boolean) => {
      selector.showLessButton().should(display ? 'exist' : 'not.exist');
    },
    pathInUrl: (path: string[]) => {
      const categoryFacetListInUrl = path.join(',');
      const urlHash = `#cf[${hierarchicalField}]=${encodeURI(
        categoryFacetListInUrl
      )}`;
      cy.url().should('include', urlHash);
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
  search: {
    ...SearchExpectations,
  },
};
