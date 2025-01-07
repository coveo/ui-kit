'use client';

import {useProductView} from '@/lib/commerce-engine';
import {useEffect, useRef} from 'react';

export default function ProductViewer({
  productId,
  name,
  price,
}: {
  productId: string;
  name: string;
  price: number;
}) {
  const product = {productId, name, price};

  const productView = useProductView();
  const productViewEventEmitted = useRef(false);

  useEffect(() => {
    if (productViewEventEmitted.current || !product) {
      return;
    }

    productView.methods?.view(product);
    productViewEventEmitted.current = true;
  }, [productView, product]);

  return null;
}
