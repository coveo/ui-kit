'use client';

import {useProductView} from '@/lib/commerce-engine';
import {useEffect} from 'react';

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
  }, []);

  return null;
}
