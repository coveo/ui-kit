import {type AfterViewInit, Component, viewChild} from '@angular/core';
import {
  AtomicAngularModule,
  AtomicCommerceInterface,
  AtomicCommerceRecommendationInterface,
} from '@coveo/atomic-angular';
import {buildEngine} from '../engine';

@Component({
  selector: 'app-home-page',
  imports: [AtomicAngularModule],
  templateUrl: './home-page.html',
})
export class HomePage implements AfterViewInit {
  private readonly searchBoxInterface = viewChild.required(AtomicCommerceInterface);
  private readonly recommendationInterface = viewChild.required(
    AtomicCommerceRecommendationInterface
  );

  ngAfterViewInit(): void {
    const engine = buildEngine('https://sports.barca.group');
    // The standalone search box only redirects, so no first request is executed.
    this.searchBoxInterface().initializeWithEngine(engine);
    this.recommendationInterface().initializeWithEngine(engine);
  }
}
