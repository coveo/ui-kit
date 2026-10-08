import {afterNextRender, Component, input, viewChild} from '@angular/core';
import {AtomicAngularModule, type AtomicCommerceInterface} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-listing-page',
  imports: [AtomicAngularModule],
  templateUrl: './listing-page.html',
})
export class ListingPage {
  // Bound from the route `data` in `app.routes.ts`.
  readonly heading = input.required<string>();
  readonly viewUrl = input.required<string>();

  private readonly commerceInterface =
    viewChild.required<AtomicCommerceInterface>('commerceInterface');

  constructor() {
    afterNextRender(async () => {
      const commerceInterface = this.commerceInterface();
      await commerceInterface.initializeWithEngine(buildEngine(this.viewUrl()));
      await commerceInterface.executeFirstRequest();
    });
  }
}
