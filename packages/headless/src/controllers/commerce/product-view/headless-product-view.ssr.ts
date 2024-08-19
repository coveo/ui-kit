import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  buildProductView,
  ProductView as BaseProductView,
} from './headless-product-view';

export interface ProductViewDefinition
  extends SharedControllerDefinitionWithoutProps<ProductView> {}

/**
 * Defines a `ProductView` controller instance.
 *
 * This controller is stateless and does not implement a `subscribe` method,
 * making it simpler but different from other controllers in the system.
 * Its sole purpose is to log an `ec_productView` event.
 *
 * @returns The `ProductView` controller definition.
 *
 * @internal
 */
export function defineProductView(): ProductViewDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildSSRProductView(engine),
  };
}

export interface ProductView extends BaseProductView, Controller {}

function buildSSRProductView(engine: CommerceEngine): ProductView {
  const controller = buildController(engine);
  const productView = buildProductView(engine);
  return {
    ...controller,
    ...productView,
  };
}
