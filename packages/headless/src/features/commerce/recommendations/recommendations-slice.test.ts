import {Action} from '@reduxjs/toolkit';
import {ChildProduct} from '../../../api/commerce/common/product.js';
import {
  buildMockChildProduct,
  buildMockProduct,
  buildMockBaseProduct,
} from '../../../test/mock-product.js';
import {buildMockRecommendationsSlice} from '../../../test/mock-recommendations-slice.js';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations.js';
import {
  fetchMoreRecommendations,
  fetchRecommendations,
  promoteChildToParent,
  registerRecommendationsSlot,
} from './recommendations-actions.js';
import {recommendationsReducer} from './recommendations-slice.js';
import {
  getRecommendationsInitialState,
  RecommendationsState,
} from './recommendations-state.js';

describe('recommendation-slice', () => {
  let state: RecommendationsState;
  const slotId = 'some-slot-id';

  beforeEach(() => {
    state = getRecommendationsInitialState();
  });

  it('should have an initial state', () => {
    expect(recommendationsReducer(undefined, {type: 'foo'})).toEqual(
      getRecommendationsInitialState()
    );
  });

  describe('on #registerRecommendationsSlot', () => {
    it('when slot already exists, does not add a new one', () => {
      state[slotId] = buildMockRecommendationsSlice();
      const originalSlot = state[slotId];

      const finalState = recommendationsReducer(
        state,
        registerRecommendationsSlot({slotId})
      );

      expect(finalState[slotId]).toEqual(originalSlot);
    });

    it('when slot does not exist, registers a new one', () => {
      const finalState = recommendationsReducer(
        state,
        registerRecommendationsSlot({slotId})
      );
      expect(finalState[slotId]).toEqual(buildMockRecommendationsSlice());
    });

    it('when slot does not exists, sets the #productId to the one provided', () => {
      const productId = 'some-product-id';
      const finalState = recommendationsReducer(
        state,
        registerRecommendationsSlot({slotId, productId})
      );
      expect(finalState[slotId]!.productId).toEqual(productId);
    });
  });

  describe('on #fetchRecommendations.fulfilled', () => {
    const result = buildMockBaseProduct();
    const responseId = 'some-response-id';
    const response = buildMockRecommendationsResponse({
      products: [result],
      responseId,
    });
    const action = fetchRecommendations.fulfilled(response, '', {slotId});

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the state to the received payload', () => {
      const baseProduct = buildMockBaseProduct({ec_name: 'product-1'});
      const responseId = 'some-response-id';
      const response = buildMockRecommendationsResponse({
        products: [baseProduct],
        responseId,
      });

      state[slotId] = buildMockRecommendationsSlice();

      const action = fetchRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);

      const slot = finalState[slotId]!;

      expect(slot.products).toEqual(
        response.response.products.map((p) =>
          buildMockProduct({ec_name: p.ec_name})
        )
      );
      expect(slot.responseId).toEqual(responseId);
      expect(slot.isLoading).toBe(false);
    });

    it('when slot exists, sets the #position of each product to its 1-based position in the unpaginated list', () => {
      const response = buildMockRecommendationsResponse({
        products: [
          buildMockBaseProduct({ec_name: 'product-1'}),
          buildMockBaseProduct({ec_name: 'product-2'}),
        ],
        pagination: {
          page: 2,
          perPage: 10,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      state[slotId] = buildMockRecommendationsSlice();

      const action = fetchRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);

      const slot = finalState[slotId]!;
      expect(slot.products[0].position).toBe(21);
      expect(slot.products[1].position).toBe(22);
    });
  });

  describe('on #fetchMoreRecommendations.fulfilled', () => {
    const responseId = 'some-response-id';
    const response = buildMockRecommendationsResponse({
      products: [
        buildMockBaseProduct({ec_name: 'product-3'}),
        buildMockBaseProduct({ec_name: 'product-4'}),
      ],
      responseId,
    });
    const action = fetchMoreRecommendations.fulfilled(response, '', {slotId});

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, appends the received payload to the state', () => {
      state[slotId] = buildMockRecommendationsSlice({
        products: [
          buildMockProduct({ec_name: 'product-1'}),
          buildMockProduct({ec_name: 'product-2'}),
        ],
      });

      const finalState = recommendationsReducer(state, action);

      const slot = finalState[slotId]!;
      expect(slot.products.map((p) => p.ec_name)).toEqual([
        'product-1',
        'product-2',
        'product-3',
        'product-4',
      ]);
      expect(slot.responseId).toEqual(responseId);
      expect(slot.isLoading).toBe(false);
    });

    it('when slot exists, sets the #position of each product to its 1-based position in the unpaginated list', () => {
      const response = buildMockRecommendationsResponse({
        products: [buildMockBaseProduct({ec_name: 'product-3'})],
        pagination: {
          page: 1,
          perPage: 2,
          totalEntries: 22,
          totalPages: 3,
        },
      });

      state[slotId] = buildMockRecommendationsSlice({
        products: [
          buildMockProduct({
            ec_name: 'product-1',
            position: 1,
          }),
          buildMockProduct({
            ec_name: 'product-2',
            position: 2,
          }),
        ],
      });

      const action = fetchMoreRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.products[0].position).toBe(1);
      expect(finalState[slotId]!.products[1].position).toBe(2);
      expect(finalState[slotId]!.products[2].position).toBe(3);
    });
  });

  describe('on #fetchRecommendations.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: fetchRecommendations.rejected.type,
      payload: err,
      meta: {
        arg: {
          slotId,
        },
      },
    };

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the error on rejection', () => {
      state[slotId] = buildMockRecommendationsSlice();

      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toEqual(err);
      expect(finalState[slotId]!.isLoading).toBe(false);
    });

    it('when slot exists, sets the error to null on success', () => {
      state[slotId] = buildMockRecommendationsSlice({
        error: {message: 'message', statusCode: 500, type: 'type'},
      });

      const response = buildMockRecommendationsResponse();

      const action = fetchRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toBeNull();
    });
  });

  describe('on #fetchMoreRecommendations.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: fetchMoreRecommendations.rejected.type,
      payload: err,
      meta: {
        arg: {
          slotId,
        },
      },
    };

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the error on rejection', () => {
      state[slotId] = buildMockRecommendationsSlice();

      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toEqual(err);
      expect(finalState[slotId]!.isLoading).toBe(false);
    });

    it('when slot exists, sets the error to null on success', () => {
      state[slotId] = buildMockRecommendationsSlice({
        error: {message: 'message', statusCode: 500, type: 'type'},
      });

      const response = buildMockRecommendationsResponse();

      const action = fetchMoreRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toBeNull();
    });
  });

  describe('on #fetchRecommendations.pending', () => {
    const action = fetchRecommendations.pending('', {slotId});

    it(
      'when slot does not exist, does not alter slot',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets #isLoading to true', () => {
      state[slotId] = buildMockRecommendationsSlice({isLoading: false});

      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.isLoading).toBe(true);
    });
  });

  describe('on #fetchMoreRecommendations.pending', () => {
    const action = fetchMoreRecommendations.pending('', {slotId});

    it(
      'when slot does not exist, does not alter slot',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets #isLoading to true', () => {
      state[slotId] = buildMockRecommendationsSlice({isLoading: false});

      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.isLoading).toBe(true);
    });
  });

  describe('on #promoteChildToParent', () => {
    const permanentid = 'child-id';
    const parentPermanentId = 'parent-id';
    let action: ReturnType<typeof promoteChildToParent>;

    beforeEach(() => {
      state[slotId] = buildMockRecommendationsSlice({isLoading: false});
      action = promoteChildToParent({
        child: {permanentid} as ChildProduct,
        slotId,
      });
    });

    it('when slot does not exist, it does not change the state', () => {
      state = {};
      expectSlotToStayUnchanged(action);
    });

    it('when parent does not exist in slot, it does not change the state', () => {
      expectSlotToStayUnchanged(action);
    });

    it('when child does not exist in slot, it does not change the state', () => {
      state[slotId]!.products = [
        buildMockProduct({permanentid: 'parent-id', children: []}),
      ];

      expectSlotToStayUnchanged(action);
    });

    it('when both parent and child exist in slot, promotes the child to parent', () => {
      const childProduct = buildMockChildProduct({
        permanentid,
        additionalFields: {test: 'test'},
        clickUri: 'child-uri',
        ec_brand: 'child brand',
        ec_category: ['child category'],
        ec_description: 'child description',
        ec_gender: 'child gender',
        ec_images: ['child image'],
        ec_in_stock: false,
        ec_item_group_id: 'child item group id',
        ec_name: 'child name',
        ec_product_id: 'child product id',
        ec_promo_price: 1,
        ec_rating: 1,
        ec_shortdesc: 'child short description',
        ec_thumbnails: ['child thumbnail'],
        ec_price: 2,
      });

      const parentProduct = buildMockProduct({
        permanentid: parentPermanentId,
        children: [childProduct],
        totalNumberOfChildren: 1,
        position: 5,
      });

      state[slotId]!.products = [parentProduct];

      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.products).toEqual([
        buildMockProduct({
          ...childProduct,
          children: parentProduct.children,
          totalNumberOfChildren: parentProduct.totalNumberOfChildren,
          position: parentProduct.position,
        }),
      ]);
    });
  });

  function expectSlotToStayUnchanged(action: Action) {
    return () => {
      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]).toBeUndefined();
    };
  }
});
