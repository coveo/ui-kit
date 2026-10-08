import {afterNextRender, Component, viewChild} from '@angular/core';
import {
  AtomicAngularModule,
  type AtomicCommerceInterface,
  type AtomicCommerceRecommendationInterface,
} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-home-page',
  imports: [AtomicAngularModule],
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly searchInterface = viewChild.required<AtomicCommerceInterface>('searchInterface');
  private readonly recommendationInterface =
    viewChild.required<AtomicCommerceRecommendationInterface>('recommendationInterface');

  constructor() {
    afterNextRender(() => {
      const engine = buildEngine('https://sports.barca.group');
      // The standalone search box only redirects to the search page, so its
      // interface doesn't execute a first request.
      this.searchInterface().initializeWithEngine(engine);
      this.recommendationInterface().initializeWithEngine(engine);
    });
  }
}
