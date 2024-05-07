import {ArrayValue, NumberValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {Product} from '../../../api/commerce/common/product';
import {validatePayload} from '../../../utils/validate-payload';
import {
  productPartialDefinition,
  validateProductPayload, // resultPartialDefinition,
} from '../../analytics/analytics-utils';

export interface RegisterRecentProductsCreatorPayload {
  /**
   * The recent products viewed by the user prior to instantiating the controller.
   */
  products: Product[];
  /**
   * The maximum number of queries to retain in the list.
   */
  maxLength: number;
}

const registerRecentProductsPayloadDefinition = {
  products: new ArrayValue({
    required: true,
    each: new RecordValue({values: productPartialDefinition}),
  }),
  maxLength: new NumberValue({required: true, min: 1, default: 10}),
};

export const registerRecentProducts = createAction(
  'recentProducts/registerRecentProducts',
  (payload: RegisterRecentProductsCreatorPayload) =>
    validatePayload(payload, registerRecentProductsPayloadDefinition)
);

export const pushRecentProduct = createAction(
  'recentProducts/pushRecentProduct',
  (payload: Product) => {
    validateProductPayload(payload);
    return {
      payload,
    };
  }
);

export const clearRecentProducts = createAction(
  'recentProducts/clearRecentProducts'
);
