import {
  buildProductListingRelevanceSortCriterion,
  ProductListingSortCriterion,
} from './product-listing-sort';

export type ProductListingSortState = ProductListingSortCriterion;

export function getProductListingSortInitialState(): ProductListingSortState {
  return buildProductListingRelevanceSortCriterion();
}
