import {useEffect, useRef} from 'react';
import type {BundleTierConfig, Product} from '@core/types/commerce.js';

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

interface BundleTierWithProducts extends Omit<BundleTierConfig, 'slots'> {
  slots: BundleSlotWithProduct[];
}

interface BundleDisplayProps {
  title: string;
  bundles: BundleTierWithProducts[];
  isLoading?: boolean;
}

interface BundleDisplayElement extends HTMLElement {
  heading: string;
  bundles: BundleTierWithProducts[];
  isLoading: boolean;
}

export function BundleDisplay({
  title,
  bundles,
  isLoading = false,
}: BundleDisplayProps) {
  const elementRef = useRef<BundleDisplayElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.heading = title;
      elementRef.current.bundles = bundles;
      elementRef.current.isLoading = isLoading;
    }
  }, [title, bundles, isLoading]);

  return <cac-bundle-display ref={elementRef} />;
}
