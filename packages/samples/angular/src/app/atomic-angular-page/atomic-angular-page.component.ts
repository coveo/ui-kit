import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Result, Bindings} from '@coveo/atomic-angular';

@Component({
  selector: 'app-atomic-angular-page',
  templateUrl: './atomic-angular-page.component.html',
  styleUrls: ['./atomic-angular-page.component.css'],
})
export class AtomicAngularPageComponent implements AfterViewInit {
  @ViewChild('searchInterface')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchInterface!: any;
  constructor() {}
  async ngAfterViewInit(): Promise<void> {
    console.log(this.searchInterface);
    this.searchInterface
      ?.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'electronicscoveodemocomo0n2fu8v',
        analytics: {
          enabled: true,
        },
      })

      .then(() => {
        this.searchInterface.executeFirstRequest();
        this.searchInterface.i18n.addResourceBundle('en', 'translation', {
          'no-ratings-available': 'No ratings available',
        });
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
