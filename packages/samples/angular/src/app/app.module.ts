import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';

@NgModule({
  declarations: [AppComponent, AtomicAngularPageComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
