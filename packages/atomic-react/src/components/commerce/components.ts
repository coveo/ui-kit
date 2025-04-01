import {
  AtomicCommerceProductList as LitAtomicCommerceProductList,
  AtomicComponentError as LitAtomicComponentError,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceProductList = createComponent({
  tagName: 'atomic-commerce-product-list',
  react: React,
  elementClass: LitAtomicCommerceProductList,
});

export const AtomicComponentError = createComponent({
  tagName: 'atomic-component-error',
  react: React,
  elementClass: LitAtomicComponentError,
});
