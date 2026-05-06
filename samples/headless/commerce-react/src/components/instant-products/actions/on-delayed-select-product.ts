import type {InstantProducts, Product} from '@coveo/headless/commerce';

export function getProductHoverHandlers(
  product: Product,
  controller: InstantProducts,
  navigate: (pathName: string) => void
) {
  const interactiveProduct = controller.interactiveProduct({
    options: {product},
  });

  return {
    onMouseEnter: () => interactiveProduct.beginDelayedSelect(), // callout[When the user hovers over a product, begin a delayed selection. If the user remains on the product long enough, the click event is logged automatically.]
    onMouseLeave: () => interactiveProduct.cancelPendingSelect(), // callout[If the user moves away before the delay elapses, cancel the pending selection so no event is logged.]
    onClick: () => {
      interactiveProduct.select(); // callout[On click, call `select()` on the same instance to cancel any pending delayed select and immediately log the event.]
      const productId = product.ec_product_id ?? product.permanentid;
      navigate(`/product/${productId}`);
    },
  };
}
