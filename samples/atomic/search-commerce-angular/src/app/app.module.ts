import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AtomicAngularModule} from '@coveo/atomic-angular';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';
import {AtomicAngularRecommendationPageComponent} from './atomic-angular-recommendation-page/atomic-angular-recommendation-page.component';
import {AtomicAngularRGAPageComponent} from './atomic-angular-rga-page/atomic-angular-rga-page.component';
import {AtomicAngularSearchPageComponent} from './atomic-angular-search-page/atomic-angular-search-page.component';
import {AtomicCommerceAngularPageComponent} from './atomic-commerce-angular-page/atomic-commerce-angular-page.component';
import {FieldLabelComponent} from './field-label/field-label.component';
import {FieldValueComponent} from './field-value/field-value.component';
import {LabelAndFieldValueComponent} from './label-and-field-value/label-and-field-value.component';

@NgModule({
  declarations: [
    AppComponent,
    AtomicAngularPageComponent,
    AtomicAngularRGAPageComponent,
    AtomicAngularSearchPageComponent,
    AtomicAngularRecommendationPageComponent,
    AtomicCommerceAngularPageComponent,
    FieldLabelComponent,
    FieldValueComponent,
    LabelAndFieldValueComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, AtomicAngularModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
