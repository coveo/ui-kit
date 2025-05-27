import {
  AtomicCommerceInterface as LitAtomicCommerceInterface,
  AtomicCommercePager as LitAtomicCommercePager,
  AtomicCommerceRecommendationList as LitAtomicCommerceRecommendationList,
  AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown,
  AtomicCommerceSearchBoxQuerySuggestions as LitAtomicCommerceSearchBoxQuerySuggestions,
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

export const AtomicCommercePager = createComponent({
  tagName: 'atomic-commerce-pager',
  react: React,
  elementClass: LitAtomicCommercePager,
});

export const AtomicCommerceRecommendationList = createComponent({
  tagName: 'atomic-commerce-recommendation-list',
  react: React,
  elementClass: LitAtomicCommerceRecommendationList,
});

export const AtomicCommerceSortDropdown = createComponent({
  tagName: 'atomic-commerce-sort-dropdown',
  react: React,
  elementClass: LitAtomicCommerceSortDropdown,
});

export const AtomicCommerceSearchBoxQuerySuggestions = createComponent({
  tagName: 'atomic-commerce-search-box-query-suggestions',
  react: React,
  elementClass: LitAtomicCommerceSearchBoxQuerySuggestions,
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
