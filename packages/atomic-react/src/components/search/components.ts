import {AtomicText as LitAtomicText} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicText = createComponent({
  tagName: 'atomic-text',
  react: React,
  elementClass: LitAtomicText,
});
