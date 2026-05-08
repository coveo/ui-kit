import type {InstantProducts, Product} from '@coveo/headless/commerce';

export function onClickProduct(
  product: Product,
  controller: InstantProducts,
  navigate: (pathName: string) => void
) {
  controller.interactiveProduct({options: {product}}).select();

  const productId = product.ec_product_id ?? product.permanentid;
  const productName = product.ec_name ?? product.permanentid;
  const productPrice = product.ec_promo_price ?? product.ec_price ?? NaN;
  navigate(`/product/${productId}/${productName}/${productPrice}`);
}
