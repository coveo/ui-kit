import {InterceptAliases, interceptSearch} from '../page-objects/search';
import {configure} from '../page-objects/configurator';
import {selectors as facet} from '../page-objects/example-quantic-facet';

describe('quantic-facet', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-facet`);
  });

  it('should render correctly', () => {
    configure({
      field: 'objecttype',
      label: 'Type',
      numberOfValues: 8,
      sortCriteria: 'automatic',
      noSearch: false,
    })
      .get(facet.title)
      .should('contain', 'Type')
      .get(facet.collapse)
      .should('exist')
      .get(facet.searchbox)
      .should('exist')
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.more)
      .should('exist');
  });

  it('should render correctly with other field, less values, and no search', () => {
    configure({
      field: 'language',
      label: 'Language',
      numberOfValues: 4,
      sortCriteria: 'automatic',
      noSearch: true,
    })
      .get(facet.title)
      .should('contain', 'Language')
      .get(facet.collapse)
      .should('exist')
      .get(facet.searchbox)
      .should('not.exist')
      .get(facet.value)
      .should('have.length', 4)
      .should('contain', 'English')
      .get(facet.more)
      .should('exist');
  });

  it('should display more values when clicking more button and reset when clicking less button', () => {
    configure()
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.more)
      .click()
      .get(facet.value)
      .should('have.length.greaterThan', 8)
      .get(facet.more)
      .should('exist')
      .get(facet.less)
      .click()
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.less)
      .should('not.exist');
  });

  it('should collapse and expand when clicking the button', () => {
    configure({
      numberOfValues: 8,
      noSearch: false,
    })
      .get(facet.collapse)
      .click()
      .get(facet.title)
      .should('exist')
      .get(facet.value)
      .should('not.exist')
      .get(facet.more)
      .should('not.exist')
      .get(facet.searchbox)
      .should('not.exist')
      .get(facet.expand)
      .click()
      .get(facet.title)
      .should('exist')
      .get(facet.searchbox)
      .should('exist')
      .get(facet.value)
      .should('have.length', 8)
      .get(facet.more)
      .should('exist');
  });

  it('should search when typing in the searchbox', () => {
    configure({
      noSearch: false,
    })
      .get(facet.value)
      .first()
      .then(($value) => {
        const firstFacetValue = $value.attr('data-cy') ?? '';

        cy.get(facet.searchbox)
          .type(firstFacetValue)
          .get(facet.value)
          .should('have.length', 1)
          .get(facet.searchClear)
          .click()
          .get(facet.value)
          .should('have.length', 8);
      });
  });

  it('should filter results when selecting values', () => {
    interceptSearch()
      .then(() => configure())
      .wait(InterceptAliases.Search)
      .get(facet.value)
      .first()
      .then(($value) => {
        const firstFacetValue = $value.attr('data-cy');
        cy.get(facet.value)
          .first()
          .find(facet.valueCheckbox)
          .check({force: true})
          .wait(InterceptAliases.Search)
          .then((interception) => {
            const facetRequest =
              interception.request.body.facets[0].currentValues.find(
                (v) => v.value === firstFacetValue
              );
            expect(facetRequest.state).to.equal('selected');
          })
          .get(facet.clear)
          .click()
          .wait(InterceptAliases.Search)
          .then((interception) => {
            const selectedValues =
              interception.request.body.facets[0].currentValues.find(
                (v) => v.state !== 'idle'
              );
            expect(selectedValues).to.be.undefined;
          });
      });
  });

  describe('given specific sorting', () => {
    ['automatic', 'score', 'alphanumeric', 'occurrences'].forEach((sorting) => {
      it(`should order value with '${sorting}' sorting`, () => {
        interceptSearch()
          .then(() =>
            configure({
              sortCriteria: sorting,
            })
          )
          .wait(InterceptAliases.Search)
          .then((interception) => {
            const facetRequest = interception.request.body.facets[0];

            expect(facetRequest.sortCriteria).to.equal(sorting);
          });
      });
    });
  });
});
