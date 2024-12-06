import {AtomicText as LitAtomicText} from '@coveo/atomic/components/atomic-text';
import {createComponent} from '@lit/react';
import React from 'react';

export * from '../stencil-generated/search/index.js';
export {Bindings, i18n} from '@coveo/atomic';

export const AtomicText = createComponent({
  react: React,
  tagName: 'atomic-text',
  elementClass: LitAtomicText,
});

// Important: Re-exporting under the same name (eg: "AtomicSearchInterface") shadows the original component
// and should wrap it nicely for users of the library
export {SearchInterfaceWrapper as AtomicSearchInterface} from './SearchInterfaceWrapper.js';
export {ResultListWrapper as AtomicResultList} from './ResultListWrapper.js';
export {FoldedResultListWrapper as AtomicFoldedResultList} from './FoldedResultListWrapper.js';
export {SearchBoxInstantResultsWrapper as AtomicSearchBoxInstantResults} from './SearchBoxInstantResultsWrapper.js';
