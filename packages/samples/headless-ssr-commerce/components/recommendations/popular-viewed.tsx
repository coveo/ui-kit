'use client';

import {usePopularViewed} from '@/lib/commerce-engine';
import {Product} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

export default function PopularViewed() {
  const {state, methods} = usePopularViewed();

  const router = useRouter();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <>
      <ul>
        <h3>{state.headline}</h3>
        {state.products.map((product) => (
          <li key={product.ec_product_id}>
            <button disabled={!methods} onClick={() => onProductClick(product)}>
              {product.ec_name}
              <Image
                src={product.ec_images[0]}
                alt={product.ec_name!}
                width={50}
                height={50}
              />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
