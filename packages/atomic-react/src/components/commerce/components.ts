import {
  AtomicCommerceSearchBox as LitAtomicCommerceSearchBox,
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceSearchBox = createComponent({
  tagName: 'atomic-commerce-search-box',
  react: React,
  elementClass: LitAtomicCommerceSearchBox,
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
