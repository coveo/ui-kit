import {type AfterViewInit, Component, input, viewChild} from '@angular/core';
import {AtomicAngularModule, AtomicCommerceInterface} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-listing-page',
  imports: [AtomicAngularModule],
  templateUrl: './listing-page.html',
})
export class ListingPage implements AfterViewInit {
  /** Bound from the route's `data` (see `app.routes.ts`). */
  readonly title = input.required<string>();
  /** Catalog URL that selects which product listing to load. */
  readonly viewUrl = input.required<string>();

  private readonly commerceInterface = viewChild.required(AtomicCommerceInterface);

  async ngAfterViewInit(): Promise<void> {
    const commerceInterface = this.commerceInterface();
    await commerceInterface.initializeWithEngine(buildEngine(this.viewUrl()));
    commerceInterface.executeFirstRequest();
  }
}
