import {NgModule} from '@angular/core';
import {RouterModule, type Routes} from '@angular/router';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';
import {AtomicAngularRecommendationPageComponent} from './atomic-angular-recommendation-page/atomic-angular-recommendation-page.component';
import {AtomicAngularRGAPageComponent} from './atomic-angular-rga-page/atomic-angular-rga-page.component';
import {AtomicAngularSearchPageComponent} from './atomic-angular-search-page/atomic-angular-search-page.component';
import {AtomicCommerceAngularPageComponent} from './atomic-commerce-angular-page/atomic-commerce-angular-page.component';

const routes: Routes = [
  {
    path: 'atomic-angular',
    component: AtomicAngularPageComponent,
  },
  {
    path: 'atomic-rga-angular',
    component: AtomicAngularRGAPageComponent,
  },
  {
    path: 'atomic-search-angular',
    component: AtomicAngularSearchPageComponent,
  },
  {
    path: 'atomic-recommendation-angular',
    component: AtomicAngularRecommendationPageComponent,
  },
  {
    path: 'atomic-commerce-angular',
    component: AtomicCommerceAngularPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
