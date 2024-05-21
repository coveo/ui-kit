import {createAction} from '@reduxjs/toolkit';
import {
  corePromoteChildToParentDefinition,
  CorePromoteChildToParentActionCreatorPayload,
} from '../../../controllers/commerce/core/common';
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

export interface PromoteInstantProductChildToParentActionCreatorPayload
  extends UpdateInstantProductQueryActionCreatorPayload,
    CorePromoteChildToParentActionCreatorPayload {}

const instantProductsIdDefinition = {
  id: requiredNonEmptyString,
};

const instantProductsQueryDefinition = {
  ...instantProductsIdDefinition,
  query: requiredEmptyAllowedString,
};

export const registerInstantProducts = createAction(
  'instantProducts/register',
  (payload: RegisterInstantProductActionCreatorPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

export const updateInstantProductsQuery = createAction(
  'instantProducts/updateQuery',
  (payload: UpdateInstantProductQueryActionCreatorPayload) =>
    validatePayload(payload, instantProductsQueryDefinition)
);

export const clearExpiredProducts = createAction(
  'instantProducts/clearExpired',
  (payload: ClearExpiredInstantProductsActionCreatorPayload) =>
    validatePayload(payload, instantProductsIdDefinition)
);

const promoteInstantProductChildToParentDefinition = {
  ...corePromoteChildToParentDefinition,
  ...instantProductsQueryDefinition,
};

export const promoteChildToParent = createAction(
  'commerce/instantProducts/promoteChildToParent',
  (payload: PromoteInstantProductChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteInstantProductChildToParentDefinition)
);
