import {test as base} from '@playwright/test';
import {ResultPrintableUriPageObject as PrintableUri} from './page-object';

type MyFixtures = {
  printableUri: PrintableUri;
};

export const test = base.extend<MyFixtures>({
  printableUri: async ({page}, use) => {
    await use(new PrintableUri(page));
  },
});

export {expect} from '@playwright/test';
