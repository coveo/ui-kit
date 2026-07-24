import type {Product, ProductList, Recommendations} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';

interface ProductButtonWithImageProps {
  methods:
    | Omit<Recommendations, 'state' | 'subscribe'>
    | Omit<ProductList, 'state' | 'subscribe'>
    | undefined;
  product: Product;
}

/**
 * Renders a product as a clickable image + name. Selecting it logs a product
 * click event and opens the product's real page (`clickUri`).
 */
export default function ProductButtonWithImage({methods, product}: ProductButtonWithImageProps) {
  const onProductClick = () => {
    methods?.interactiveProduct({options: {product}}).select();
    window.open(product.clickUri, '_blank', 'noopener,noreferrer');
  };

  const image = product.ec_images?.[0];

  return (
    <button type="button" className="ProductLink" disabled={!methods} onClick={onProductClick}>
      {image ? (
        <Image
          className="ProductImage"
          src={image}
          alt={product.ec_name ?? ''}
          width={150}
          height={150}
        />
      ) : (
        <span className="ProductImage ProductImagePlaceholder" aria-hidden="true" />
      )}
      <span className="ProductName">{product.ec_name}</span>
    </button>
  );
}
