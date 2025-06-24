import {createComponent} from '@lit/react';
import React from 'react';
import {
  AtomicComponentError as LitAtomicComponentError,
  AtomicIcon as LitAtomicIcon,
} from '@coveo/atomic/components';

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
