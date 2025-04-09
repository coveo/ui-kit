import {
  AtomicCommerceSearchBox as LitAtomicCommerceSearchBox,
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
  AtomicCommerceSearchBoxInstantProducts as LitAtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions as LitAtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries as LitAtomicCommerceSearchBoxRecentQueries,
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
