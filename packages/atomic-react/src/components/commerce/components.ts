import {
  AtomicCommerceInterface as LitAtomicCommerceInterface,
  AtomicCommerceUrlManager as LitAtomicCommerceUrlManager,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceInterface = createComponent({
  tagName: 'atomic-commerce-interface',
  react: React,
  elementClass: LitAtomicCommerceInterface,
});

export const AtomicCommerceUrlManager = createComponent({
  tagName: 'atomic-commerce-url-manager',
  react: React,
  elementClass: LitAtomicCommerceUrlManager,
});
