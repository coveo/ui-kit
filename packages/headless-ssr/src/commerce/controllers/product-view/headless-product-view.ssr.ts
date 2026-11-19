import type {CommerceEngine} from '@coveo/headless/commerce';
import {type ProductView as BaseProductView, buildProductView} from '@coveo/headless/commerce';
import {buildController, type Controller} from '@coveo/headless/commerce';
import type {NonRecommendationControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type ProductViewDefinition = NonRecommendationControllerDefinitionWithoutProps<ProductView>;

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
