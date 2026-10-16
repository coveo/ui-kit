import {Component, CUSTOM_ELEMENTS_SCHEMA, type ElementRef, viewChild} from '@angular/core';
import {defineCustomElements} from '@coveo/atomic/loader';
import {fromEvent} from 'rxjs';
import {SearchPage, type SearchInterfaceMethods} from './search-page';

defineCustomElements();

@Component({
  selector: 'app-custom-elements-search-page',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './search-page.html',
})
export class CustomElementsSearchPageComponent extends SearchPage {
  private readonly searchInterface =
    viewChild.required<ElementRef<HTMLElement & SearchInterfaceMethods>>('searchInterface');
  private readonly searchLayout = viewChild.required<ElementRef<HTMLElement>>('searchLayout');

  protected async getSearchInterface() {
    await customElements.whenDefined('atomic-search-interface');
    return this.searchInterface().nativeElement;
  }

  protected breakpointChanges() {
    return fromEvent(this.searchLayout().nativeElement, 'atomic-layout-breakpoint-change');
  }
}
