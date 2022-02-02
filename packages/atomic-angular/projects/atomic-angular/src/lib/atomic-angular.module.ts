import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {
  AtomicSearchInterface,
  AtomicSearchBox,
  AtomicResultList,
  AtomicLoadMoreResults,
} from './stencil-generated/components';

import {defineCustomElements} from '@coveo/atomic/loader';
defineCustomElements(window);

const DECLARATIONS = [
  AtomicSearchInterface,
  AtomicSearchBox,
  AtomicResultList,
  AtomicLoadMoreResults,
];

@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  providers: [],
  imports: [CommonModule],
})
export class AtomicAngularModule {
  static forRoot(): ModuleWithProviders<AtomicAngularModule> {
    return {
      ngModule: AtomicAngularModule,
      providers: [],
    };
  }
}
