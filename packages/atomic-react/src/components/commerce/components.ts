import {
  AtomicCommerceLoadMoreProducts as LitAtomicCommerceLoadMoreProducts,
  AtomicIcon as LitAtomicIcon,
  AtomicComponentError as LitAtomicComponentError,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceLoadMoreProducts = createComponent({
  tagName: 'atomic-commerce-load-more-products',
  react: React,
  elementClass: LitAtomicCommerceLoadMoreProducts,
});

export const AtomicIcon = createComponent({
  tagName: 'atomic-icon',
  react: React,
  elementClass: LitAtomicIcon,
});

export const AtomicComponentError = createComponent({
  tagName: 'atomic-component-error',
  react: React,
  elementClass: LitAtomicComponentError,
});
