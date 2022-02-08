import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-atomic-angular-page',
  templateUrl: './atomic-angular-page.component.html',
  styleUrls: ['./atomic-angular-page.component.css'],
})
export class AtomicAngularPageComponent implements AfterViewInit {
  constructor() {}
  ngAfterViewInit(): void {
    const searchInterface = document.querySelector('atomic-search-interface');
    searchInterface
      ?.initialize({
        accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
        organizationId: 'electronicscoveodemocomo0n2fu8v',
      })
      .then(() => {
        searchInterface.executeFirstSearch();
      });
  }
}
