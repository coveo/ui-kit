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
 * Defines a `ProductView` controller.
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
