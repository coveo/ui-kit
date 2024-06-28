import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {ChildProduct} from '../../../api/commerce/common/product';
import {
  validatePayload,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

export interface CoreInstantProductActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
}

export interface RegisterInstantProductActionCreatorPayload
  extends CoreInstantProductActionCreatorPayload {}

export interface UpdateInstantProductQueryActionCreatorPayload
  extends CoreInstantProductActionCreatorPayload {
  /**
   * The initial basic query expression for instant products.
   */
  query: string;
}

export interface ClearExpiredInstantProductsActionCreatorPayload
  extends CoreInstantProductActionCreatorPayload {}

const instantProductsIdDefinition = {
  id: requiredNonEmptyString,
};

const instantProductsQueryDefinition = {
  ...instantProductsIdDefinition,
  query: requiredEmptyAllowedString,
};

export const registerInstantProducts = createAction(
  'commerce/instantProducts/register',
  (payload: RegisterInstantProductActionCreatorPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

export const updateInstantProductsQuery = createAction(
  'commerce/instantProducts/updateQuery',
  (payload: UpdateInstantProductQueryActionCreatorPayload) =>
    validatePayload(payload, instantProductsQueryDefinition)
);

export const clearExpiredProducts = createAction(
  'commerce/instantProducts/clearExpired',
  (payload: ClearExpiredInstantProductsActionCreatorPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

export interface PromoteChildToParentActionCreatorPayload
  extends UpdateInstantProductQueryActionCreatorPayload {
  child: ChildProduct;
}

export const promoteChildToParentDefinition = {
  child: new RecordValue({
    options: {required: true},
    values: {
      permanentid: new StringValue({required: true}),
    },
  }),
  ...instantProductsQueryDefinition,
};

export const promoteChildToParent = createAction(
  'commerce/instantProducts/promoteChildToParent',
  (payload: PromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
