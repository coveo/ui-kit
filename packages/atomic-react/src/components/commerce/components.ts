import {
  AtomicCommerceInterface as LitAtomicCommerceInterface,
  AtomicCommerceLayout as LitAtomicCommerceLayout,
  AtomicCommercePager as LitAtomicCommercePager,
  AtomicCommerceSearchBoxInstantProducts as LitAtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions as LitAtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries as LitAtomicCommerceSearchBoxRecentQueries,
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

export const AtomicCommerceLayout = createComponent({
  tagName: 'atomic-commerce-layout',
  react: React,
  elementClass: LitAtomicCommerceLayout,
});

export const AtomicCommercePager = createComponent({
  tagName: 'atomic-commerce-pager',
  react: React,
  elementClass: LitAtomicCommercePager,
});

export const AtomicCommerceSearchBoxInstantProducts = createComponent({
  tagName: 'atomic-commerce-search-box-instant-products',
  react: React,
  elementClass: LitAtomicCommerceSearchBoxInstantProducts,
});

export const AtomicCommerceSearchBoxQuerySuggestions = createComponent({
  tagName: 'atomic-commerce-search-box-query-suggestions',
  react: React,
  elementClass: LitAtomicCommerceSearchBoxQuerySuggestions,
});

export const AtomicCommerceSearchBoxRecentQueries = createComponent({
  tagName: 'atomic-commerce-search-box-recent-queries',
  react: React,
  elementClass: LitAtomicCommerceSearchBoxRecentQueries,
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
