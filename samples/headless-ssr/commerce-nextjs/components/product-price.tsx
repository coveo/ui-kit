'use client';

import type {Product} from '@coveo/headless-react/ssr-commerce';
import {formatCurrency} from '@/utils/format-currency';

interface ProductPriceProps {
  product: Product;
  language: string;
  currency: string;
}

/**
 * Renders a product's price. When a promotional price lower than the base
 * price is available, the adjusted (promotional) price is shown alongside the
 * original base price, struck through.
 */
export default function ProductPrice({
  product,
  language,
  currency,
}: ProductPriceProps) {
  const price = product.ec_price;
  const promoPrice = product.ec_promo_price;

  if (promoPrice != null && price != null && promoPrice < price) {
    return (
      <span className="ProductPrice ProductPrice--discounted">
        <span className="ProductPricePromo">
          {formatCurrency(promoPrice, language, currency)}
        </span>
        <s className="ProductPriceOriginal">
          {formatCurrency(price, language, currency)}
        </s>
      </span>
    );
  }

  const effectivePrice = price ?? promoPrice;
  if (effectivePrice != null) {
    return (
      <span className="ProductPrice">
        {formatCurrency(effectivePrice, language, currency)}
      </span>
    );
  }

  return (
    <span className="ProductPrice ProductPriceUnavailable">
      Price not available
    </span>
  );
}
