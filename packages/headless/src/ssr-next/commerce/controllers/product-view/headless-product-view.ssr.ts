import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {
  type ProductView as BaseProductView,
  buildProductView,
} from '../../../../controllers/commerce/product-view/headless-product-view.js';
import {
  buildController,
  type Controller,
} from '../../../../controllers/controller/headless-controller.js';
import type {NonRecommendationControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

interface ProductViewDefinition
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
