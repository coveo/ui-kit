import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';

const routes: Routes = [
  {
    path: 'atomic-angular',
    component: AtomicAngularPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
