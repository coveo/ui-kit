import {AtomicIcon as LitAtomicIcon} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export const AtomicIcon = createComponent({
  tagName: 'atomic-icon',
  react: React,
  elementClass: LitAtomicIcon,
});
