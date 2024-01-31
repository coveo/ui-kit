import {toggleSelectCommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/facet-set-actions';
import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {CommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceCategoryFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine';
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {
  CommerceCategoryFacet,
  CommerceCategoryFacetOptions,
  buildCommerceCategoryFacet,
} from './headless-commerce-category-facet';

describe('CommerceCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let options: CommerceCategoryFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceCategoryFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceCategoryFacet(engine, options);
  }

  function setFacetRequestAndResponse(
    config: Partial<Omit<CommerceFacetRequest, 'facetId' | 'type'>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({
        facetId,
        type: 'hierarchical',
        ...config,
      }),
    });
    state.productListing.facets = [
      buildMockCommerceCategoryFacetResponse({
        facetId,
        type: 'hierarchical',
        values: (config.values as CommerceCategoryFacetValue[]) ?? [],
      }),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
      ...commonOptions,
    };

    state = buildMockCommerceState();
    setFacetRequestAndResponse();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    it('dispatches a #toggleSelectFacetValue', () => {
      const facetValue = buildMockCommerceCategoryFacetValue();
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectCommerceCategoryFacetValue({
          facetId,
          selection: facetValue,
        })
      );
    });
  });

  describe('#canShowLessValues', () => {
    describe('when there is no selected value', () => {
      it('calls #canShowLessValues from core controller', () => {});

      it('returns "true" if #numberOfValues is greater than #initialNumberOfValues', () => {
        const value = buildMockCommerceCategoryFacetValue();
        setFacetRequestAndResponse({
          initialNumberOfValues: 1,
          numberOfValues: 2,
          values: [value],
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(true);
      });
      it('returns "false" if #values is empty', () => {
        setFacetRequestAndResponse({
          initialNumberOfValues: 1,
          numberOfValues: 2,
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(false);
      });
      it('returns "false" if #numberOfValues and #initialNumberOfValues are equal', () => {
        const value = buildMockCommerceCategoryFacetValue();
        setFacetRequestAndResponse({
          initialNumberOfValues: 1,
          numberOfValues: 1,
          values: [value],
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(false);
      });

      it('returns "false" if #numberOfValues is lesser than #initialNumberOfValues', () => {
        const value = buildMockCommerceCategoryFacetValue();
        setFacetRequestAndResponse({
          initialNumberOfValues: 1,
          numberOfValues: 0,
          values: [value],
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(false);
      });
    });

    describe('when there is a selected value', () => {
      it('returns "true" if selected value has more children than initial number of values', () => {
        const value = buildMockCommerceCategoryFacetValue({
          state: 'selected',
          children: [
            buildMockCommerceCategoryFacetValue(),
            buildMockCommerceCategoryFacetValue(),
          ],
        });

        setFacetRequestAndResponse({
          values: [value],
          initialNumberOfValues: 1,
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(true);
      });
      it('returns "false" if selected value has less children than initial number of values', () => {
        const value = buildMockCommerceCategoryFacetValue({
          state: 'selected',
          children: [],
        });

        setFacetRequestAndResponse({
          values: [value],
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(false);
      });
      it('returns "false" if selected value has the same number of children as initial number of values', () => {
        const value = buildMockCommerceCategoryFacetValue({
          state: 'selected',
          children: [buildMockCommerceCategoryFacetValue()],
        });

        setFacetRequestAndResponse({
          values: [value],
          initialNumberOfValues: 1,
        });

        initFacet();

        expect(facet.canShowLessValues).toBe(false);
      });
    });
  });

  describe('#canShowMoreValues', () => {
    describe('when there is not selected value', () => {
      it('returns "true" if response has #moreValuesAvailable "true"', () => {
        state.productListing.facets = [
          buildMockCommerceCategoryFacetResponse({
            facetId,
            type: 'hierarchical',
            moreValuesAvailable: true,
          }),
        ];

        initFacet();

        expect(facet.canShowMoreValues).toBe(true);
      });

      it('returns "false" if response has #moreValuesAvailable "false"', () => {
        state.productListing.facets = [
          buildMockCommerceCategoryFacetResponse({
            facetId,
            type: 'hierarchical',
            moreValuesAvailable: false,
          }),
        ];

        initFacet();

        expect(facet.canShowMoreValues).toBe(false);
      });
    });

    describe('when there is a selected value', () => {
      it('returns "true" if selected value has #moreValuesAvailable "true"', () => {
        const value = buildMockCommerceCategoryFacetValue({
          state: 'selected',
          moreValuesAvailable: true,
        });

        setFacetRequestAndResponse({
          values: [value],
        });

        initFacet();

        expect(facet.canShowMoreValues).toBe(true);
      });
      it('returns "false" if selected value has #moreValuesAvailable "false"', () => {
        const value = buildMockCommerceCategoryFacetValue({
          state: 'selected',
          moreValuesAvailable: false,
        });

        setFacetRequestAndResponse({
          values: [value],
        });

        initFacet();

        expect(facet.canShowMoreValues).toBe(false);
      });
    });
  });

  describe('#selectedValueWithAncestry', () => {
    it('when no value is present, returns "undefined"', () => {
      expect(facet.selectedValueWithAncestry).toBeUndefined();
    });

    it('when values are present but no value is selected, returns "undefined"', () => {
      setFacetRequestAndResponse({
        values: [
          buildMockCommerceCategoryFacetValue(),
          buildMockCommerceCategoryFacetValue(),
          buildMockCommerceCategoryFacetValue(),
        ],
      });

      initFacet();

      expect(facet.selectedValueWithAncestry).toBeUndefined();
    });

    it('when a value is selected, returns the selected value and its ancestry', () => {
      const selected = buildMockCommerceCategoryFacetValue({
        value: 'child',
        state: 'selected',
        path: ['root', 'parent', 'child'],
      });

      const sibling = buildMockCommerceCategoryFacetValue({
        value: 'sibling',
        state: 'idle',
        path: ['root', 'parent', 'child'],
      });

      const parent = buildMockCommerceCategoryFacetValue({
        value: 'parent',
        state: 'idle',
        children: [selected, sibling],
        path: ['root', 'parent'],
      });

      const root = buildMockCommerceCategoryFacetValue({
        value: 'root',
        state: 'idle',
        children: [parent],
        path: ['root'],
      });

      setFacetRequestAndResponse({
        values: [root],
      });

      initFacet();

      expect(facet.selectedValueWithAncestry).toEqual({
        selected,
        ancestry: [root, parent, selected],
      });
    });
  });
});
