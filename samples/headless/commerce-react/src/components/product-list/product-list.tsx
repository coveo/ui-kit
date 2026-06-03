import type {
  Cart,
  ChildProduct,
  InteractiveProduct as HeadlessInteractiveProduct,
  Product as HeadlessProduct,
  InteractiveProductProps,
} from '@coveo/headless/commerce';
import InteractiveProduct from '../interactive-product/interactive-product.js';

interface IProductListProps {
  products: HeadlessProduct[];
  controllerBuilder: (
    props: InteractiveProductProps
  ) => HeadlessInteractiveProduct;
  cartController: Cart;
  promoteChildToParent: (product: ChildProduct) => void;
  navigate: (pathName: string) => void;
}

export default function ProductList(props: IProductListProps) {
  const {
    products,
    controllerBuilder,
    cartController,
    promoteChildToParent,
    navigate,
  } = props;

  if (products.length === 0) {
    return null;
  }

  return (
    <ul className="ProductList">
      {products.map((product) => (
        <li className="Product" key={product.permanentid}>
          <InteractiveProduct
            product={product}
            controller={controllerBuilder({options: {product}})}
            cartController={cartController}
            navigate={navigate}
            promoteChildToParent={promoteChildToParent}
          ></InteractiveProduct>
        </li>
      ))}
    </ul>
  );
}
