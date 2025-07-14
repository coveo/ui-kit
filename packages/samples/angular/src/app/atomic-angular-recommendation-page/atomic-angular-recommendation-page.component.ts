import {type AfterViewInit, Component, ViewChild} from '@angular/core';
import type {
  AtomicRecsInterface,
  Bindings,
  Result,
} from '@coveo/atomic-angular';

@Component({
  standalone: false,
  selector: 'app-atomic-angular-recommendation-page',
  templateUrl: './atomic-angular-recommendation-page.component.html',
  styleUrls: ['./atomic-angular-recommendation-page.component.css'],
})
export class AtomicAngularRecommendationPageComponent implements AfterViewInit {
  @ViewChild('recsInterface')
  searchInterface!: AtomicRecsInterface;

  async ngAfterViewInit(): Promise<void> {
    this.searchInterface
      ?.initialize({
        accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
        organizationId: 'electronicscoveodemocomo0n2fu8v',
        analytics: {
          analyticsMode: 'legacy',
        },
      })
      .then(() => {
        this.searchInterface.getRecommendations();
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
          // biome-ignore lint/complexity/useLiteralKeys: <>
          count: result.raw['ec_rating'] as number,
          max: 5,
        })
      );
    } else {
      information.push(i18n.t('no-ratings-available'));
    }

    if ('ec_price' in result.raw) {
      information.push(
        // biome-ignore lint/complexity/useLiteralKeys: <>
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
