import {should} from '../common-selectors';

import {
  RefineContentSelector,
  RefineContentSelectors,
} from './refine-modal-content-selectors';

const COMMON_FACET_PROPERTIES = ['facetId', 'field', 'label'];
const DEFAULT_FACET_PROPERTIES = [
  'numberOfValues',
  'sortCriteria',
  'noSearch',
  'displayValuesAs',
  'noFilterFacetCount',
  'injectionDepth',
];
const NUMERIC_FACET_PROPERTIES = [
  'numberOfValues',
  'sortCriteria',
  'rangeAlgorithm',
  'withInput',
];
const CATEGORY_FACET_PROPERTIES = [
  'basePath',
  'noFilterByBasePath',
  'noFilterFacetCount',
  'delimitingCharacter',
  'numberOfValues',
  'sortCriteria',
  'withSearch',
];
const TIMEFRAME_FACET_PROPERTIES = [
  'withDatePicker',
  'noFilterFacetCount',
  'injectionDepth',
];

function refineContentExpectations(selector: RefineContentSelector) {
  return {
    displayFiltersTitle: () => {
      selector
        .filtersTitle()
        .should('exist')
        .logDetail('should display the filters title');
    },

    displayClearAllFiltersButton: () => {
      selector
        .clearAllFiltersButton()
        .should('exist')
        .logDetail('should display the clear all filters button');
    },

    displayFacetManager: () => {
      selector
        .facetManager()
        .should('exist')
        .logDetail('should display the facet manager.');
    },

    displayDuplicatedNumericFacet: () => {
      selector
        .numericFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.container.numericFacet().then((facet) => {
            [...COMMON_FACET_PROPERTIES, ...NUMERIC_FACET_PROPERTIES].forEach(
              (property) => {
                expect(duplicatedFacet[0]).to.have.property(
                  property,
                  facet[0][property]
                );
              }
            );
            expect(duplicatedFacet[0].formattingFunction).to.be.eq(
              facet[0].formattingFunction
            );
            expect(duplicatedFacet[0]).to.have.property('isCollapsed', true);
          });
        })
        .logDetail('should display the duplicated numeric facet');
    },

    displayDuplicatedFacet: () => {
      selector
        .facet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.container.facet().then((facet) => {
            [...COMMON_FACET_PROPERTIES, ...DEFAULT_FACET_PROPERTIES].forEach(
              (property) => {
                expect(duplicatedFacet[0]).to.have.property(
                  property,
                  facet[0][property]
                );
              }
            );
            expect(duplicatedFacet[0]).to.have.property('isCollapsed', true);
          });
        })
        .logDetail('should display the duplicated facet');
    },

    displayDuplicatedCategoryFacet: () => {
      selector
        .categoryFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.container.categoryFacet().then((facet) => {
            [...COMMON_FACET_PROPERTIES, ...CATEGORY_FACET_PROPERTIES].forEach(
              (property) => {
                expect(duplicatedFacet[0]).to.have.property(
                  property,
                  facet[0][property]
                );
              }
            );
            expect(duplicatedFacet[0]).to.have.property('isCollapsed', true);
          });
        })
        .logDetail('should display the duplicated category facet');
    },

    displayDuplicatedTimeframeFacet: () => {
      selector
        .timeframeFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.container.timeframeFacet().then((facet) => {
            [...COMMON_FACET_PROPERTIES, ...TIMEFRAME_FACET_PROPERTIES].forEach(
              (property) => {
                expect(duplicatedFacet[0]).to.have.property(
                  property,
                  facet[0][property]
                );
              }
            );
            expect(duplicatedFacet[0]).to.have.property('isCollapsed', true);
          });
        })
        .logDetail('should display the duplicated timeframe facet');
    },

    displaySort: (display: boolean) => {
      selector
        .sort()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the Quantic Sort component`);
    },

    displayDuplicatedTimeframeFacetClearFiltersButton: (display: boolean) => {
      selector
        .timeframeFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the duplicated timeframe facet`
        );
    },

    displayDuplicatedFacetClearFiltersButton: (display: boolean) => {
      selector
        .facetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the duplicated facet`
        );
    },

    displayTimeframeFacetClearFiltersButton: (display: boolean) => {
      selector.container
        .timeframeFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the timeframe facet`
        );
    },

    displayFacetClearFiltersButton: (display: boolean) => {
      selector.container
        .facetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the clear filters button in the facet`
        );
    },

    correctFacetsOrder: () => {
      selector
        .facetManagerItems()
        .should('exist')
        .then((duplicatedFacetManagerItems) => {
          const duplicatedFacetsOrder = [];
          for (
            let index = 0;
            index < duplicatedFacetManagerItems.length;
            index++
          ) {
            duplicatedFacetsOrder.push(
              duplicatedFacetManagerItems[index].firstChild.tagName
            );
          }
          selector.container
            .facetManagerItems()
            .should('exist')
            .then((facetManagerItems) => {
              const facetsOrder = [];
              for (let index = 0; index < facetManagerItems.length; index++) {
                facetsOrder.push(facetManagerItems[index].firstChild.tagName);
              }
              expect(facetsOrder).to.eql(duplicatedFacetsOrder);
            });
        })
        .logDetail('should order the facets correctly');
    },
  };
}

export const RefineContentExpectations = {
  ...refineContentExpectations(RefineContentSelectors),
};
