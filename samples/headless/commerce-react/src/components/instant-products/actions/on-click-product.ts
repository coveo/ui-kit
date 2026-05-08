import type {InstantProducts, Product} from '@coveo/headless/commerce';

export function onClickProduct(
  product: Product,
  controller: InstantProducts,
  navigate: (pathName: string) => void
) {
  controller.interactiveProduct({options: {product}}).select();

  const productId = product.ec_product_id ?? product.permanentid;
  navigate(`/product/${productId}`);
}
