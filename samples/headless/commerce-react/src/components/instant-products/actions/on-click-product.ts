import type {InstantProducts, Product} from '@coveo/headless/commerce';

export function onClickProduct(
  product: Product,
  controller: InstantProducts,
  navigate: (pathName: string) => void
) {
  controller.interactiveProduct({options: {product}}).select(); // callout[Calling `select()` on the `InteractiveProduct` sub-controller logs the click event with all required metadata, including the `responseId`.]

  const productId = product.ec_product_id ?? product.permanentid;
  navigate(`/product/${productId}`); // callout[After logging the event, navigate to the product detail page.]
}
