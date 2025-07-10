// @ts-ignore Stencil does not support subpath exports.
import {defineCustomElements} from '@coveo/atomic/loader';

export function waitForAtomic() {
  defineCustomElements();
  return customElements.whenDefined('atomic-search-interface');
}
