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
    onMouseEnter: () => interactiveProduct.beginDelayedSelect(),
    onMouseLeave: () => interactiveProduct.cancelPendingSelect(),
    onClick: () => {
      interactiveProduct.select();
      const productId = product.ec_product_id ?? product.permanentid;
      const productName = product.ec_name ?? product.permanentid;
      const productPrice = product.ec_promo_price ?? product.ec_price ?? NaN;
      navigate(`/product/${productId}/${productName}/${productPrice}`);
    },
  };
}
