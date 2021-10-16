import {
  baseFacetExpectations,
  facetWithValuesExpectations,
  facetWithSearchExpectations,
  facetWithShowMoreLessExpectations,
} from '../facet-common-expectations';
import {
  CategoryFacetSelectors,
  CategoryFacetSelector,
} from './category-facet-selectors';

const categoryFacetExpectations = (selector: CategoryFacetSelector) => {
  return {
    numberOfChildValues: (value: number) => {
      it(`should display ${value} child value options`, () => {
        selector.childValueOption().should('have.length', value);
      });
    },
    numberOfParentValues: (value: number) => {
      it(`should display ${value} parent value options`, () => {
        selector.parentValueOption().should('have.length', value);
      });
    },
  };
};
export const CategoryFacetExpectations = {
  ...baseFacetExpectations(CategoryFacetSelectors),
  ...facetWithSearchExpectations(CategoryFacetSelectors),
  ...facetWithShowMoreLessExpectations(CategoryFacetSelectors),
  ...categoryFacetExpectations(CategoryFacetSelectors),
};
