import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';
import {AtomicAngularRecommendationPageComponent} from './atomic-angular-recommendation-page/atomic-angular-recommendation-page.component';
import {AtomicCommerceAngularPageComponent} from './atomic-commerce-angular-page/atomic-commerce-angular-page.component';

const routes: Routes = [
  {
    path: 'atomic-angular',
    component: AtomicAngularPageComponent,
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
