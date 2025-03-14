import {AtomicCommerceProductList as LitAtomicCommerceProductList} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceProductList = createComponent({
  tagName: 'atomic-commerce-product-list',
  react: React,
  elementClass: LitAtomicCommerceProductList,
});
