import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {
  productListingCriterionDefinition,
  ProductListingSortDirection,
  ProductListingSortBy,
  ProductListingSortByRelevance,
  ProductListingSortByFieldsFields,
  ProductListingSortByFields,
  ProductListingSortCriterion,
  buildProductListingRelevanceSortCriterion,
  buildProductListingFieldsSortCriterion,
} from '../../../features/product-listing/product-listing-sort';
import {CoreEngine} from '../../../app/engine';
import {
  ConfigurationSection,
  ProductListingSortSection,
} from '../../../state/state-sections';
import {configuration, productListingSort} from '../../../app/reducers';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {loadReducerError} from '../../../utils/errors';
import {
  registerProductListingSortCriterion,
  updateProductListingSortCriterion,
} from '../../../features/product-listing/product-listing-sort-actions';
import {Schema} from '@coveo/bueno';
import {validateInitialState} from '../../../utils/validate-payload';

export {
  ProductListingSortBy,
  ProductListingSortDirection,
  ProductListingSortByRelevance,
  ProductListingSortByFields,
  ProductListingSortByFieldsFields,
  ProductListingSortCriterion,
  buildProductListingRelevanceSortCriterion,
  buildProductListingFieldsSortCriterion,
};

export interface ProductListingSort extends Controller {
  sortBy(criterion: ProductListingSortCriterion): void;

  isSortedBy(criterion: ProductListingSortCriterion): boolean;

  state: ProductListingSortState;
}

export interface ProductListingSortState {
  sort: ProductListingSortCriterion;
}

export interface ProductListingSortProps {
  initialState?: ProductListingSortInitialState;
}

export interface ProductListingSortInitialState {
  criterion?: ProductListingSortCriterion;
}

function validateSortInitialState(
  engine: CoreEngine<ConfigurationSection & ProductListingSortSection>,
  state: ProductListingSortInitialState | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<ProductListingSortInitialState>({
    criterion: productListingCriterionDefinition,
  });

  validateInitialState(engine, schema, state, 'buildSort');
}

export function buildSort(
  engine: ProductListingEngine,
  props: ProductListingSortProps = {}
): ProductListingSort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(registerProductListingSortCriterion(criterion));
  }

  return {
    ...controller,

    sortBy(criterion: ProductListingSortCriterion) {
      dispatch(updateProductListingSortCriterion(criterion));
      dispatch(updatePage(1));
      dispatch(fetchProductListing());
    },

    isSortedBy(criterion: ProductListingSortCriterion) {
      return this.state.sort === criterion;
    },

    get state() {
      return {
        sort: getState().productListingSort,
      };
    },
  };
}

function loadSortReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & ProductListingSortSection> {
  engine.addReducers({configuration, productListingSort});
  return true;
}
