import type {Product} from '@core/types/commerce.js';
import {useEffect, useRef} from 'react';

export interface ProductSection {
  heading: string;
  products: Product[];
}

interface ProductCarouselProps {
  sections: ProductSection[];
  isLoading?: boolean;
}

interface ProductCarouselElement extends HTMLElement {
  sections: ProductSection[];
  isLoading: boolean;
}

export function ProductCarousel({
  sections,
  isLoading = false,
}: ProductCarouselProps) {
  const elementRef = useRef<ProductCarouselElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.sections = sections;
      elementRef.current.isLoading = isLoading;
    }
  }, [sections, isLoading]);

  return <cac-product-carousel ref={elementRef} />;
}
