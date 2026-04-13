import {useEffect, useRef} from 'react';
import type {Product} from '@core/types/commerce.js';

interface PriceDisplayElement extends HTMLElement {
  product: Product;
}

export function PriceDisplay({product}: {product: Product}) {
  const elementRef = useRef<PriceDisplayElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.product = product;
    }
  }, [product]);

  return <cac-price-display ref={elementRef} />;
}
