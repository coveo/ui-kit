import {bootstrapApplication} from '@angular/platform-browser';

import {AppComponent} from './app/app.component';

void loadRuntimeConfig()
  .then(() => bootstrapApplication(AppComponent))
  .catch((error) => {
    console.error(error);
  });

async function loadRuntimeConfig() {
  const response = await fetch('/config.json', {cache: 'no-store'});

  if (!response.ok) {
    throw new Error(
      `Failed to load runtime config from /config.json (${response.status})`
    );
  }

  (window as Window & {__config__?: unknown}).__config__ =
    await response.json();
}
