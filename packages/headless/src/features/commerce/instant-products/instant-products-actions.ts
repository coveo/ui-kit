import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {ChildProduct} from '../../../api/commerce/common/product.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';

export interface CoreInstantProductPayload {
  /**
   * The search box ID.
   */
  id: string;
}

const instantProductsIdDefinition = {
  id: requiredNonEmptyString,
};

const instantProductsQueryDefinition = {
  ...instantProductsIdDefinition,
  query: requiredEmptyAllowedString,
};

export type ClearExpiredInstantProductsPayload = CoreInstantProductPayload;

export const clearExpiredProducts = createAction(
  'commerce/instantProducts/clearExpired',
  (payload: ClearExpiredInstantProductsPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

const promoteChildToParentDefinition = {
  child: new RecordValue({
    options: {required: true},
    values: {
      permanentid: new StringValue({required: true}),
    },
  }),
  ...instantProductsQueryDefinition,
};

export interface PromoteChildToParentPayload
  extends UpdateInstantProductQueryPayload {
  child: ChildProduct;
}

export const promoteChildToParent = createAction(
  'commerce/instantProducts/promoteChildToParent',
  (payload: PromoteChildToParentPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);

export interface UpdateInstantProductQueryPayload
  extends CoreInstantProductPayload {
  /**
   * The initial basic query expression for instant products.
   */
  query: string;
}

export type RegisterInstantProductPayload = CoreInstantProductPayload;

export const registerInstantProducts = createAction(
  'commerce/instantProducts/register',
  (payload: RegisterInstantProductPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

export const updateInstantProductsQuery = createAction(
  'commerce/instantProducts/updateQuery',
  (payload: UpdateInstantProductQueryPayload) =>
    validatePayload(payload, instantProductsQueryDefinition)
);
