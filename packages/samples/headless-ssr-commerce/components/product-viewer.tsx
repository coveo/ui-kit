'use client';

import {useProductView} from '@/lib/commerce-engine';
import {useEffect, useRef} from 'react';

interface Product {
  productId: string;
  name: string;
  price: number;
}

export default function ProductViewer({productId, name, price}: Product) {
  const {methods} = useProductView();
  const productViewEventEmitted = useRef(false);

  useEffect(() => {
    if (methods && !productViewEventEmitted.current) {
      methods?.view({productId, name, price});
      productViewEventEmitted.current = true;
    }
  }, []);

  return null;
}
