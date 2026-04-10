import type {Product} from '../../types/commerce.js';
import './PriceDisplay.css';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function PriceDisplay({product}: {product: Product}) {
  const promoPrice = product.ec_promo_price;
  const hasDiscount = promoPrice != null && promoPrice < product.ec_price;

  if (hasDiscount) {
    return (
      <span className="price-display">
        <span className="price-original">{formatPrice(product.ec_price)}</span>
        <span className="price-promo">{formatPrice(promoPrice)}</span>
      </span>
    );
  }

  return (
    <span className="price-display">
      <span className="price-regular">{formatPrice(product.ec_price)}</span>
    </span>
  );
}
