import {type AfterViewInit, Component, ViewChild} from '@angular/core';
import type {
  AtomicSearchInterface,
  Bindings,
  Result,
} from '@coveo/atomic-angular';

@Component({
  standalone: false,
  selector: 'app-atomic-angular-page',
  templateUrl: './atomic-angular-rga-page.component.html',
  styleUrls: ['./atomic-angular-rga-page.component.css'],
})
export class AtomicAngularRGAPageComponent implements AfterViewInit {
  @ViewChild('searchInterface')
  searchInterface!: AtomicSearchInterface;

  async ngAfterViewInit(): Promise<void> {
    this.searchInterface
      ?.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
        search: {
          pipeline: 'genqatest',
        },
      })
      .then(() => {
        this.searchInterface.executeFirstSearch();
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
          // biome-ignore lint/complexity/useLiteralKeys: <angular needs this>
          count: result.raw['ec_rating'] as number,
          max: 5,
        })
      );
    } else {
      information.push(i18n.t('no-ratings-available'));
    }

    if ('ec_price' in result.raw) {
      information.push(
        // biome-ignore lint/complexity/useLiteralKeys: <angular needs this>
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
