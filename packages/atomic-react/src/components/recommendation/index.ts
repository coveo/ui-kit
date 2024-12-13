import {AtomicText as LitAtomicText} from '@coveo/atomic/components';
import {createComponent} from '@lit/react';
import React from 'react';

export * from '../stencil-generated/search/index.js';
export {RecsBindings, i18n} from '@coveo/atomic';

// Important: Re-exporting under the same name (eg: "AtomicRecsInterface") shadows the original component
// and should wrap it nicely for users of the library
export {RecsInterfaceWrapper as AtomicRecsInterface} from './RecsInterfaceWrapper.js';
export {RecsListWrapper as AtomicRecsList} from './RecsListWrapper.js';

export const AtomicText = createComponent({
  react: React,
  tagName: 'atomic-text',
  elementClass: LitAtomicText,
});
