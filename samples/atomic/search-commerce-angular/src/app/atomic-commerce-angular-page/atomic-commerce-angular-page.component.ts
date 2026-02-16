import {type AfterViewInit, Component, ViewChild} from '@angular/core';
import type {AtomicCommerceInterface} from '@coveo/atomic-angular';

@Component({
  standalone: false,
  selector: 'app-atomic-commerce-angular-page',
  templateUrl: './atomic-commerce-angular-page.component.html',
  styleUrls: ['./atomic-commerce-angular-page.component.css'],
})
export class AtomicCommerceAngularPageComponent implements AfterViewInit {
  @ViewChild('commerceInterface')
  commerceInterface!: AtomicCommerceInterface;

  async ngAfterViewInit(): Promise<void> {
    this.commerceInterface
      ?.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        analytics: {
          trackingId: 'sports-ui-samples',
        },
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD',
          view: {
            url: 'https://sports.barca.group',
          },
        },
        cart: {
          items: [
            {
              productId: 'SP01057_00001',
              quantity: 1,
              name: 'Kayaker Canoe',
              price: 800,
            },
            {
              productId: 'SP00081_00001',
              quantity: 1,
              name: 'Bamboo Canoe Paddle',
              price: 120,
            },
            {
              productId: 'SP04236_00005',
              quantity: 1,
              name: 'Eco-Brave Rashguard',
              price: 33,
            },
            {
              productId: 'SP04236_00005',
              quantity: 1,
              name: 'Eco-Brave Rashguard',
              price: 33,
            },
          ],
        },
        organizationId: 'searchuisamples',
      })
      .then(() => {
        this?.commerceInterface.executeFirstRequest();
      });
  }
}
