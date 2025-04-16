import {
  AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown,
  AtomicIcon as LitAtomicIcon,
  AtomicComponentError as LitAtomicComponentError,
  AtomicCommerceFacet as LitAtomicCommerceFacet,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

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

export const AtomicCommerceFacet = createComponent({
  tagName: 'atomic-commerce-facet',
  react: React,
  elementClass: LitAtomicCommerceFacet,
});
