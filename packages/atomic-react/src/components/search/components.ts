import {
  AtomicText as LitAtomicText,
  AtomicText2 as LitAtomicText2,
} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicText = createComponent({
  tagName: 'atomic-text',
  react: React,
  elementClass: LitAtomicText,
});

export const AtomicText2 = createComponent({
  tagName: 'atomic-text2',
  react: React,
  elementClass: LitAtomicText2,
});
