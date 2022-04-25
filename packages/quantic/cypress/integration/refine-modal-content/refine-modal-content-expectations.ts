import {should} from '../common-selectors';

import {
  RefineContentSelector,
  RefineContentSelectors,
} from './refine-modal-content-selectors';

const CUMMON_FACET_PROPERTIES = ['facetId', 'field', 'label'];
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
        .logDetail('should display the filters title.');
    },

    displayClearAllFiltersButton: () => {
      selector
        .clearAllFiltersButton()
        .should('exist')
        .logDetail('should display the clear all filters button.');
    },

    displayFacetManager: () => {
      selector
        .duplicatedFacetManager()
        .should('exist')
        .logDetail('should display the facet manager.');
    },

    displayDuplicatedNumericFacet: () => {
      selector
        .duplicatedNumericFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.numericFacet().then((facet) => {
            [...CUMMON_FACET_PROPERTIES, ...NUMERIC_FACET_PROPERTIES].forEach(
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
        .logDetail('should display the duplicated numeric facet.');
    },

    displayDuplicatedFacet: () => {
      selector
        .duplicatedFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.facet().then((facet) => {
            [...CUMMON_FACET_PROPERTIES, ...DEFAULT_FACET_PROPERTIES].forEach(
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
        .logDetail('should display the duplicated facet.');
    },

    displayDuplicatedCategoryFacet: () => {
      selector
        .duplicatedCategoryFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.categoryFacet().then((facet) => {
            [...CUMMON_FACET_PROPERTIES, ...CATEGORY_FACET_PROPERTIES].forEach(
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
        .logDetail('should display the duplicated category facet.');
    },

    displayDuplicatedTimeframeFacet: () => {
      selector
        .duplicatedTimeframeFacet()
        .should('exist')
        .then((duplicatedFacet) => {
          selector.timeframeFacet().then((facet) => {
            [...CUMMON_FACET_PROPERTIES, ...TIMEFRAME_FACET_PROPERTIES].forEach(
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
        .logDetail('should display the duplicated timeframe facet.');
    },

    displaySort: (display: boolean) => {
      selector
        .sort()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the Quantic Sort component.`);
    },

    displayDuplicatedTimeframeFacetClearFilterButton: (display: boolean) => {
      selector
        .duplicatedTimeframeFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the duplicated timeframe facet.`
        );
    },

    displayDuplicatedFacetClearFilterButton: (display: boolean) => {
      selector
        .duplicatedFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the duplicated facet.`
        );
    },

    displayTimeframeFacetClearFilterButton: (display: boolean) => {
      selector
        .timeframeFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(
            display
          )} display the clear filters button in the timeframe facet.`
        );
    },

    displayFacetClearFilterButton: (display: boolean) => {
      selector
        .duplicatedFacetClearFiltersButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the clear filters button in the facet.`
        );
    },

    correctFacetsOrder: () => {
      selector
        .duplicatedFacetManagerItems()
        .should('exist')
        .then((duplicatedFacetManagerItems) => {
          const duplicatedFacetsOrder = duplicatedFacetManagerItems.map(
            (index) => duplicatedFacetManagerItems[index].firstChild.tagName
          );
          selector
            .facetManagerItems()
            .should('exist')
            .then((facetManagerItems) => {
              const facetsOrder = facetManagerItems.map(
                (index) => facetManagerItems[index].firstChild.tagName
              );
              expect(facetsOrder.length).to.be.eq(duplicatedFacetsOrder.length);
              for (let index = 0; index < facetsOrder.length; index++) {
                expect(facetsOrder[index]).to.be.eq(
                  duplicatedFacetsOrder[index]
                );
              }
            });
        })
        .logDetail('should order the facets correctly.');
    },
  };
}

export const RefineContentExpectations = {
  ...refineContentExpectations(RefineContentSelectors),
};
