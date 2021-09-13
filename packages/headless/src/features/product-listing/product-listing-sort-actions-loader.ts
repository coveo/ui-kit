import {PayloadAction} from '@reduxjs/toolkit';
import {productListingSort} from '../../app/reducers';
import {ProductListingSortCriterion} from './product-listing-sort';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  registerProductListingSortCriterion,
  updateProductListingSortCriterion,
} from './product-listing-sort-actions';

export interface ProductListingSortActionCreators {
  registerSortCriterion(
    criterion: ProductListingSortCriterion
  ): PayloadAction<ProductListingSortCriterion>;

  updateSortCriterion(
    criterion: ProductListingSortCriterion
  ): PayloadAction<ProductListingSortCriterion>;
}

export function loadProductListingSortActions(
  engine: SearchEngine
): ProductListingSortActionCreators {
  engine.addReducers({productListingSort});

  return {
    registerSortCriterion: registerProductListingSortCriterion,
    updateSortCriterion: updateProductListingSortCriterion,
  };
}
