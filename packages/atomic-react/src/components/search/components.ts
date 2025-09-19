import {
  AtomicAriaLive as LitAtomicAriaLive,
  AtomicComponentError as LitAtomicComponentError,
  AtomicFormatNumber as LitAtomicFormatNumber,
  AtomicIcon as LitAtomicIcon,
  AtomicLayoutSection as LitAtomicLayoutSection,
  AtomicResultsPerPage as LitAtomicResultsPerPage,
  AtomicSearchLayout as LitAtomicSearchLayout,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicAriaLive = createComponent({
  tagName: 'atomic-aria-live',
  react: React,
  elementClass: LitAtomicAriaLive,
});

export const AtomicComponentError = createComponent({
  tagName: 'atomic-component-error',
  react: React,
  elementClass: LitAtomicComponentError,
});

export const AtomicFormatNumber = createComponent({
  tagName: 'atomic-format-number',
  react: React,
  elementClass: LitAtomicFormatNumber,
});

export const AtomicIcon = createComponent({
  tagName: 'atomic-icon',
  react: React,
  elementClass: LitAtomicIcon,
});

export const AtomicLayoutSection = createComponent({
  tagName: 'atomic-layout-section',
  react: React,
  elementClass: LitAtomicLayoutSection,
});

export const AtomicResultsPerPage = createComponent({
  tagName: 'atomic-results-per-page',
  react: React,
  elementClass: LitAtomicResultsPerPage,
});

export const AtomicSearchLayout = createComponent({
  tagName: 'atomic-search-layout',
  react: React,
  elementClass: LitAtomicSearchLayout,
});
