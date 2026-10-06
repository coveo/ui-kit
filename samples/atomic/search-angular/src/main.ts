import {provideRouter} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {routes} from './app/app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes)],
}).catch((error) => console.error(error));
