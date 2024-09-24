import {
  InteractiveProduct as HeadlessInteractiveProduct,
  InteractiveProductProps,
  Product as HeadlessProduct,
  Cart,
} from '@coveo/headless/commerce';
import InteractiveProduct from '../interactive-product/interactive-product.js';

interface IProductListProps {
  products: HeadlessProduct[];
  controllerBuilder: (
    props: InteractiveProductProps
  ) => HeadlessInteractiveProduct;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function ProductList(props: IProductListProps) {
  const {products, controllerBuilder, cartController, navigate} = props;

  if (products.length === 0) {
    return null;
  }

  return (
    <ul className="ProductList">
      {products.map((product, index) => (
        <li className="Product" key={index}>
          <InteractiveProduct
            product={product}
            controller={controllerBuilder({options: {product}})}
            cartController={cartController}
            navigate={navigate}
          ></InteractiveProduct>
        </li>
      ))}
    </ul>
  );
}
