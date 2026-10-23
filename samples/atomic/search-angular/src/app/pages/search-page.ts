import {type AfterViewInit, Component, viewChild} from '@angular/core';
import {AtomicAngularModule, AtomicSearchInterface} from '@coveo/atomic-angular';
import {engine} from '../engine';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage implements AfterViewInit {
  private readonly searchInterface = viewChild.required(AtomicSearchInterface);

  async ngAfterViewInit(): Promise<void> {
    const searchInterface = this.searchInterface();
    await searchInterface.initializeWithSearchEngine(engine);
    searchInterface.executeFirstSearch();
  }
}
