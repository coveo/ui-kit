import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Result, Bindings, AtomicCommerceInterface} from '@coveo/atomic-angular';

@Component({
  selector: 'app-atomic-angular-page',
  templateUrl: './atomic-angular-page.component.html',
  styleUrls: ['./atomic-angular-page.component.css'],
})
export class AtomicAngularPageComponent implements AfterViewInit {
  @ViewChild('searchInterface')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchInterface!: AtomicCommerceInterface;
  constructor() {}
  async ngAfterViewInit(): Promise<void> {
    await customElements.whenDefined('atomic-commerce-interface');
    this?.searchInterface.initialize({
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
    });
  }

  generateInstantResultsAriaLabel({i18n}: Bindings, result: Result) {
    const information = [result.title];

    if ('ec_rating' in result.raw) {
      information.push(
        i18n.t('stars', {
          count: result.raw['ec_rating'] as number,
          max: 5,
        })
      );
    } else {
      information.push(i18n.t('no-ratings-available'));
    }

    if ('ec_price' in result.raw) {
      information.push(
        (result.raw['ec_price'] as number).toLocaleString(
          i18n.languages as string[],
          {
            style: 'currency',
            currency: 'USD',
          }
        )
      );
    }

    return information.join(', ');
  }
}
