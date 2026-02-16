import {type AfterViewInit, Component, ViewChild} from '@angular/core';
import type {AtomicSearchInterface} from '@coveo/atomic-angular';

@Component({
  standalone: false,
  selector: 'app-atomic-angular-search-page',
  templateUrl: './atomic-angular-search-page.component.html',
  styleUrls: ['./atomic-angular-search-page.component.css'],
})
export class AtomicAngularSearchPageComponent implements AfterViewInit {
  @ViewChild('searchInterface2')
  searchInterface!: AtomicSearchInterface;

  async ngAfterViewInit(): Promise<void> {
    this.searchInterface
      ?.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
        analytics: {
          analyticsMode: 'legacy',
        },
      })
      .then(() => {
        this.searchInterface.executeFirstSearch();
      });
  }
}
