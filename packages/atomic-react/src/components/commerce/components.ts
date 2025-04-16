import {
  AtomicCommerceSearchBox as LitAtomicCommerceSearchBox,
  AtomicIcon as LitAtomicIcon,
  AtomicComponentError as LitAtomicComponentError,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceSearchBox = createComponent({
  tagName: 'atomic-commerce-search-box',
  react: React,
  elementClass: LitAtomicCommerceSearchBox,
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
