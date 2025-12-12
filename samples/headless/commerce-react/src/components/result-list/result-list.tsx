import type {
  Cart,
  ChildProduct,
  InteractiveProduct as HeadlessInteractiveProduct,
  InteractiveSpotlightContent as HeadlessInteractiveSpotlightContent,
  Product as HeadlessProduct,
  Result as HeadlessResult,
  InteractiveProductProps,
  InteractiveSpotlightContentProps,
} from '@coveo/headless/commerce';
import {ResultType} from '@coveo/headless/commerce';
import InteractiveProduct from '../interactive-product/interactive-product.js';
import InteractiveSpotlightContent from '../interactive-spotlight-content/interactive-spotlight-content.js';

interface IResultListProps {
  results: HeadlessResult[];
  productControllerBuilder: (
    props: InteractiveProductProps
  ) => HeadlessInteractiveProduct;
  spotlightContentControllerBuilder: (
    props: InteractiveSpotlightContentProps
  ) => HeadlessInteractiveSpotlightContent;
  cartController: Cart;
  promoteChildToParent: (product: ChildProduct) => void;
  navigate: (pathName: string) => void;
}

export default function ResultList(props: IResultListProps) {
  const {
    results,
    productControllerBuilder,
    spotlightContentControllerBuilder,
    cartController,
    promoteChildToParent,
    navigate,
  } = props;

  if (results.length === 0) {
    return null;
  }

  return (
    <ul className="ResultList">
      {results.map((result) =>
        result.resultType === ResultType.SPOTLIGHT ? (
          <li className="Result" key={result.id + result.position}>
            <InteractiveSpotlightContent
              spotlightContent={result}
              controller={spotlightContentControllerBuilder({
                options: {spotlightContent: result},
              })}
            />
          </li>
        ) : (
          <li className="Result" key={result.permanentid}>
            <InteractiveProduct
              product={result as HeadlessProduct}
              controller={productControllerBuilder({
                options: {product: result as HeadlessProduct},
              })}
              cartController={cartController}
              navigate={navigate}
              promoteChildToParent={promoteChildToParent}
            />
          </li>
        )
      )}
    </ul>
  );
}
