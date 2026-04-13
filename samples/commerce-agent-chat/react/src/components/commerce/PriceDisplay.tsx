import {
  formatPrice,
  hasDiscount,
  promoPrice,
} from '@core/lib/commerceHelpers.js';
import type {Product} from '@core/types/commerce.js';
import './PriceDisplay.css';

export {formatPrice};

export function PriceDisplay({product}: {product: Product}) {
  const promo = promoPrice(product);
  const hasPromoDiscount = hasDiscount(product);

  if (hasPromoDiscount) {
    return (
      <span className="price-display">
        <span className="price-original">{formatPrice(product.ec_price)}</span>
        <span className="price-promo">{formatPrice(promo)}</span>
      </span>
    );
  }

  return (
    <span className="price-display">
      <span className="price-regular">{formatPrice(product.ec_price)}</span>
    </span>
  );
}
