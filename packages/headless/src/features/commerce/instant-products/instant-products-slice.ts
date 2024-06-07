import {createReducer} from '@reduxjs/toolkit';
import {Product, RawProduct} from '../../../api/commerce/common/product';
import {
  clearExpiredItems,
  fetchItemsFulfilled,
  fetchItemsPending,
  fetchItemsRejected,
  registerInstantItem,
  updateInstantItemQuery,
} from '../../instant-items/instant-items-slice';
import {fetchInstantProducts} from '../search/search-actions';
import {
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions';
import {getInstantProductsInitialState} from './instant-products-state';

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
              preprocessProduct(product, index + 1)
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

        const currentParentIndex = products.findIndex(
          (product) => product.permanentid === action.payload.parentPermanentId
        );

        if (currentParentIndex === -1) {
          return;
        }

        const position = products[currentParentIndex].position;

        const {children, totalNumberOfChildren} = products[currentParentIndex];

        const childToPromote = children.find(
          (child) => child.permanentid === action.payload.childPermanentId
        );

        if (childToPromote === undefined) {
          return;
        }

        const newParent: Product = {
          ...childToPromote,
          children,
          totalNumberOfChildren,
          position,
        };

        const newProducts = [...products];
        newProducts.splice(currentParentIndex, 1, newParent);

        cache.products = newProducts;
      });
  }
);

function preprocessProduct(product: RawProduct, position: number): Product {
  const isParentAlreadyInChildren = product.children.some(
    (child) => child.permanentid === product.permanentid
  );
  if (product.children.length === 0 || isParentAlreadyInChildren) {
    return {...product, position};
  }

  const {children, totalNumberOfChildren, ...restOfProduct} = product;

  return {
    ...product,
    children: [restOfProduct, ...children],
    position,
  };
}
