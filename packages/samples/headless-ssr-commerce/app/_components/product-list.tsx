import {
  Product,
  ProductList as ProductListingController,
  ProductListState,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

interface ProductListProps {
  staticState: ProductListState;
  controller?: ProductListingController;
}

export default function ProductList({
  staticState,
  controller,
}: ProductListProps) {
  const [state, setState] = useState(staticState);

  const router = useRouter();

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  const onProductClick = (product: Product) => {
    controller?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button
            disabled={!controller}
            onClick={() => onProductClick(product)}
          >
            {product.ec_name}
          </button>
        </li>
      ))}
    </ul>
  );
}
