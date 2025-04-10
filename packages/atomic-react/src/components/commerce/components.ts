import {
  AtomicCommerceLoadMoreProducts as LitAtomicCommerceLoadMoreProducts,
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
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

export const AtomicIcon = createComponent({
  tagName: 'atomic-icon',
  react: React,
  elementClass: LitAtomicIcon,
});
