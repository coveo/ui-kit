'use client';

import {useEffect} from 'react';
import {useProductView} from '@/lib/commerce-engine';

interface Product {
  productId: string;
  name: string;
  price: number;
}

export default function ProductViewer({productId, name, price}: Product) {
  const {methods} = useProductView();
  let productViewEventEmitted = false;

  useEffect(() => {
    if (methods && !productViewEventEmitted) {
      methods?.view({productId, name, price});
      productViewEventEmitted = true;
    }
  }, [methods, name, price, productId, productViewEventEmitted]);

  return null;
}
