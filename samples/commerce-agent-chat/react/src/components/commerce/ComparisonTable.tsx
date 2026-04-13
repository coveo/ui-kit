import type {Product} from '@core/types/commerce.js';
import {useEffect, useRef} from 'react';

interface ComparisonTableProps {
  heading: string;
  products: Product[];
  attributes?: string[];
  isLoading?: boolean;
}

interface ComparisonTableElement extends HTMLElement {
  heading: string;
  products: Product[];
  comparisonAttributes: string[];
  isLoading: boolean;
}

export function ComparisonTable({
  heading,
  products,
  attributes = [],
  isLoading = false,
}: ComparisonTableProps) {
  const elementRef = useRef<ComparisonTableElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.heading = heading;
      elementRef.current.products = products;
      elementRef.current.comparisonAttributes = attributes;
      elementRef.current.isLoading = isLoading;
    }
  }, [heading, products, attributes, isLoading]);

  return <cac-comparison-table ref={elementRef} />;
}
