import {
  AtomicAriaLive as LitAtomicAriaLive,
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
  AtomicLayoutSection as LitAtomicLayoutSection,
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
