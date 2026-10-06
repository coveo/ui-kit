import {type AfterViewInit, Component, viewChild} from '@angular/core';
import {AtomicAngularModule, AtomicCommerceInterface} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage implements AfterViewInit {
  private readonly commerceInterface = viewChild.required(AtomicCommerceInterface);

  async ngAfterViewInit(): Promise<void> {
    const commerceInterface = this.commerceInterface();
    await commerceInterface.initializeWithEngine(
      buildEngine('https://sports.barca.group/commerce-search')
    );
    commerceInterface.executeFirstRequest();
  }
}
