import {createReducer} from '@reduxjs/toolkit';
import type {
  BaseProduct,
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import {ResultType} from '../../../api/commerce/common/result.js';
import {
  clearExpiredItems,
  fetchItemsFulfilled,
  fetchItemsPending,
  fetchItemsRejected,
  registerInstantItem,
  updateInstantItemQuery,
} from '../../instant-items/instant-items-slice.js';
import {fetchInstantProducts} from '../search/search-actions.js';
import {
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions.js';
import {getInstantProductsInitialState} from './instant-products-state.js';

export const instantProductsReducer = createReducer(
  getInstantProductsInitialState(),
  (builder) => {
    builder
      .addCase(registerInstantProducts, (state, action) => {
        registerInstantItem(action.payload, state);
      })
      .addCase(updateInstantProductsQuery, (state, action) => {
        updateInstantItemQuery(
          {...action.payload, q: action.payload.query},
          state
        );
      })
      .addCase(clearExpiredProducts, (state, action) => {
        clearExpiredItems(action.payload, state);
      })
      .addCase(fetchInstantProducts.pending, (state, action) => {
        fetchItemsPending(action.meta.arg, state, {products: []});
      })
      .addCase(fetchInstantProducts.fulfilled, (state, action) => {
        const {
          response: {
            products,
            responseId,
            pagination: {totalEntries},
          },
        } = action.payload;
        fetchItemsFulfilled(
          {
            duration: 0,
            searchUid: responseId,
            totalCountFiltered: totalEntries,
            ...action.meta.arg,
          },
          state,
          {
            products: products.map((product, index) =>
              preprocessProduct(product, index + 1, responseId)
            ),
          }
        );
      })
      .addCase(fetchInstantProducts.rejected, (state, action) => {
        fetchItemsRejected(action.meta.arg, state);
      })
      .addCase(promoteChildToParent, (state, action) => {
        const cache = state[action.payload.id].cache[action.payload.query];
        if (!cache) {
          return;
        }
        const products = cache.products;

        let childToPromote: ChildProduct | undefined;
        const currentParentIndex = products.findIndex((product) => {
          childToPromote = product.children.find(
            (child) => child.permanentid === action.payload.child.permanentid
          );
          return !!childToPromote;
        });

        if (currentParentIndex === -1 || childToPromote === undefined) {
          return;
        }

        const responseId = products[currentParentIndex].responseId;
        const position = products[currentParentIndex].position;
        const {children, totalNumberOfChildren} = products[currentParentIndex];

        const newParent: Product = {
          ...(childToPromote as ChildProduct),
          resultType: ResultType.PRODUCT,
          children,
          totalNumberOfChildren,
          position,
          responseId,
        };

        const newProducts = [...products];
        newProducts.splice(currentParentIndex, 1, newParent);

        cache.products = newProducts;
      });
  }
);

function preprocessProduct(
  product: BaseProduct,
  position: number,
  responseId?: string
): Product {
  const isParentAlreadyInChildren = product.children.some(
    (child) => child.permanentid === product.permanentid
  );
  if (product.children.length === 0 || isParentAlreadyInChildren) {
    return {...product, position, responseId};
  }

  const {
    children,
    totalNumberOfChildren: _totalNumberOfChildren,
    ...restOfProduct
  } = product;

  return {
    ...product,
    children: [restOfProduct, ...children],
    position,
    responseId,
  };
}
