import type {
  Product,
  ProductList,
  Recommendations,
} from '@coveo/headless-react/ssr-commerce-next';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

interface ProductButtonWithImageProps {
  methods:
    | Omit<Recommendations, 'state' | 'subscribe'>
    | Omit<ProductList, 'state' | 'subscribe'>
    | undefined;
  product: Product;
}

export default function ProductButtonWithImage({
  methods,
  product,
}: ProductButtonWithImageProps) {
  const router = useRouter();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <button
      type="button"
      disabled={!methods}
      onClick={() => onProductClick(product)}
    >
      {product.ec_name}
      <Image
        src={product.ec_images[0]}
        alt={product.ec_name!}
        width={50}
        height={50}
      />
    </button>
  );
}
