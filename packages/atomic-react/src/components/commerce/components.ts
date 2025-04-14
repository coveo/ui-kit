import {
  AtomicCommerceInterface as LitAtomicCommerceInterface,
  AtomicCommerceProductList as LitAtomicCommerceProductList,
  AtomicCommerceRecommendationInterface as LitAtomicCommerceRecommendationInterface,
  AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown,
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicCommerceInterface = createComponent({
  tagName: 'atomic-commerce-interface',
  react: React,
  elementClass: LitAtomicCommerceInterface,
});

export const AtomicCommerceProductList = createComponent({
  tagName: 'atomic-commerce-product-list',
  react: React,
  elementClass: LitAtomicCommerceProductList,
});

export const AtomicCommerceRecommendationInterface = createComponent({
  tagName: 'atomic-commerce-recommendation-interface',
  react: React,
  elementClass: LitAtomicCommerceRecommendationInterface,
});

export const AtomicCommerceSortDropdown = createComponent({
  tagName: 'atomic-commerce-sort-dropdown',
  react: React,
  elementClass: LitAtomicCommerceSortDropdown,
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
