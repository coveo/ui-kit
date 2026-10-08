import {afterNextRender, Component, viewChild} from '@angular/core';
import {AtomicAngularModule, type AtomicCommerceInterface} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage {
  private readonly commerceInterface =
    viewChild.required<AtomicCommerceInterface>('commerceInterface');

  constructor() {
    afterNextRender(async () => {
      const commerceInterface = this.commerceInterface();
      await commerceInterface.initializeWithEngine(
        buildEngine('https://sports.barca.group/commerce-search')
      );
      await commerceInterface.executeFirstRequest();
    });
  }
}
