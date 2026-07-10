import type {InstantProducts, Product} from '@coveo/headless/commerce';

export function onClickProduct(product: Product, controller: InstantProducts) {
  controller.interactiveProduct({options: {product}}).select();
  window.open(product.clickUri, '_blank', 'noopener,noreferrer');
}
