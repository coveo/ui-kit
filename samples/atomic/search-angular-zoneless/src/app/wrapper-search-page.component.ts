import {Component, viewChild} from '@angular/core';
import {
  AtomicAngularModule,
  type AtomicSearchInterface,
  type AtomicSearchLayout,
} from '@coveo/atomic-angular';
import {SearchPage} from './search-page';

@Component({
  selector: 'app-wrapper-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class WrapperSearchPageComponent extends SearchPage {
  private readonly searchInterface = viewChild.required<AtomicSearchInterface>('searchInterface');
  private readonly searchLayout = viewChild.required<AtomicSearchLayout>('searchLayout');

  protected async getSearchInterface() {
    return this.searchInterface();
  }

  protected breakpointChanges() {
    return this.searchLayout()['atomic-layout-breakpoint-change'];
  }
}
