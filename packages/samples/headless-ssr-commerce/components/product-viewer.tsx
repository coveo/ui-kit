'use client';

import {useProductView} from '@/lib/commerce-engine';
import {useEffect, useRef} from 'react';

interface Product {
  productId: string;
  name: string;
  price: number;
}

export default function ProductViewer({productId, name, price}: Product) {
  const product = {productId, name, price};

  const {methods: productViewMethods} = useProductView();
  const productViewEventEmitted = useRef(false);

  useEffect(() => {
    if (productViewEventEmitted.current || !product || !productViewMethods) {
      return;
    }

    productViewMethods?.view(product);
    productViewEventEmitted.current = true;
  }, [productViewMethods, product]);

  return null;
}
