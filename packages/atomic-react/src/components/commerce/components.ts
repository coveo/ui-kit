import {
  AtomicCommerceLoadMoreProducts as LitAtomicCommerceLoadMoreProducts,
  AtomicComponentError as LitAtomicComponentError,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceLoadMoreProducts = createComponent({
  tagName: 'atomic-commerce-load-more-products',
  react: React,
  elementClass: LitAtomicCommerceLoadMoreProducts,
});

export const AtomicComponentError = createComponent({
  tagName: 'atomic-component-error',
  react: React,
  elementClass: LitAtomicComponentError,
});
