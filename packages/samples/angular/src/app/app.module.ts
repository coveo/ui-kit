import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AtomicAngularModule} from '@coveo/atomic-angular';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AtomicAngularPageComponent} from './atomic-angular-page/atomic-angular-page.component';
import {FieldLabelComponent} from './field-label/field-label.component';
import {FieldValueComponent} from './field-value/field-value.component';
import {LabelAndFieldValueComponent} from './label-and-field-value/label-and-field-value.component';

@NgModule({
  declarations: [
    AppComponent,
    AtomicAngularPageComponent,
    FieldLabelComponent,
    FieldValueComponent,
    LabelAndFieldValueComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, AtomicAngularModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
