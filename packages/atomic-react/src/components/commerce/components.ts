import {
  AtomicCommerceInterface as LitAtomicCommerceInterface,
  AtomicCommercePager as LitAtomicCommercePager,
  AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown,
  AtomicIcon as LitAtomicIcon,
  AtomicComponentError as LitAtomicComponentError,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceInterface = createComponent({
  tagName: 'atomic-commerce-interface',
  react: React,
  elementClass: LitAtomicCommerceInterface,
});

export const AtomicCommercePager = createComponent({
  tagName: 'atomic-commerce-pager',
  react: React,
  elementClass: LitAtomicCommercePager,
});

export const AtomicCommerceSortDropdown = createComponent({
  tagName: 'atomic-commerce-sort-dropdown',
  react: React,
  elementClass: LitAtomicCommerceSortDropdown,
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
