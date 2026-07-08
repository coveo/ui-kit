import type {
  Cart,
  ChildProduct,
  InteractiveProduct as HeadlessInteractiveProduct,
  Product,
  Result as HeadlessResult,
  InteractiveProductProps,
} from '@coveo/headless/commerce';
import {ResultType} from '@coveo/headless/commerce';
import InteractiveProduct from '../interactive-product/interactive-product.js';

interface IResultListProps {
  results: HeadlessResult[];
  productControllerBuilder: (
    props: InteractiveProductProps
  ) => HeadlessInteractiveProduct;
  cartController: Cart;
  promoteChildToParent: (product: ChildProduct) => void;
}

export default function ResultList(props: IResultListProps) {
  const {
    results,
    productControllerBuilder,
    cartController,
    promoteChildToParent,
  } = props;

  const products = results.filter(
    (result): result is Product => result.resultType !== ResultType.SPOTLIGHT
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <ul className="ResultList">
      {products.map((product) => (
        <li className="Result" key={product.permanentid}>
          <InteractiveProduct
            product={product}
            controller={productControllerBuilder({
              options: {product},
            })}
            cartController={cartController}
            promoteChildToParent={promoteChildToParent}
          />
        </li>
      ))}
    </ul>
  );
}
