import {StringValue} from '@coveo/bueno';
import {
  AsyncThunkAction,
  PayloadActionCreator,
  PrepareAction,
} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';

export type FetchProductsActionCreator = () => AsyncThunkAction<
  unknown,
  unknown,
  AsyncThunkOptions<unknown>
>;

export type ToggleActionCreator = PayloadActionCreator<
  unknown,
  string,
  PrepareAction<unknown>
>;

export interface CorePromoteChildToParentActionCreatorPayload {
  childPermanentId: string;
  parentPermanentId: string;
}

export const corePromoteChildToParentDefinition = {
  childPermanentId: new StringValue({required: true}),
  parentPermanentId: new StringValue({required: true}),
};

export interface ControllerWithPromotableChildProducts {
  /**
   * Finds the specified parent product and the specified child product of that parent, and makes that child the new
   * parent. The `children` and `totalNumberOfChildren` properties of the original parent are preserved in the new
   * parent.
   *
   * This method is useful when leveraging the product grouping feature to allow users to select nested products.
   *
   * E.g., if a product has children (such as color variations), you can call this method when the user selects a child
   * to make that child the new parent product, and re-render the product as such in the storefront.
   *
   * **Note:** In the controller state, a product that has children will always include itself as its own child so that
   * it can be rendered as a nested product, and restored as the parent product through this method as needed.
   *
   * @param childPermanentId The permanentid of the child product that will become the new parent.
   * @param parentPermanentId The permanentid of the current parent product of the child product to promote.
   */
  promoteChildToParent(
    childPermanentId: string,
    parentPermanentId: string
  ): void;
}
