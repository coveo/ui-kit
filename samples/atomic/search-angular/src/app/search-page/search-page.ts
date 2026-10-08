import {afterNextRender, Component, viewChild} from '@angular/core';
import {AtomicAngularModule, type AtomicSearchInterface} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage {
  private readonly searchInterface = viewChild.required<AtomicSearchInterface>('searchInterface');

  constructor() {
    afterNextRender(async () => {
      const searchInterface = this.searchInterface();
      await searchInterface.initializeWithSearchEngine(buildEngine());
      await searchInterface.executeFirstSearch();
    });
  }
}
