import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {NonRecommendationControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller.js';
import {
  buildProductView,
  ProductView as BaseProductView,
} from './headless-product-view.js';

export interface ProductViewDefinition
  extends NonRecommendationControllerDefinitionWithoutProps<ProductView> {}

/**
 * Defines a `ProductView` controller instance.
 *
 * This controller is stateless and does not implement a `subscribe` method,
 * making it simpler but different from other controllers in the system.
 * Its sole purpose is to log an `ec.productView` event.
 *
 * @returns The `ProductView` controller definition.
 *
 * @internal
 * @group Definers
 */
export function defineProductView(): ProductViewDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
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
