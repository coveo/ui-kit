/* eslint-disable @cspell/spellchecker */

import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class DidYouMeanPageObject extends BasePageObject<'atomic-did-you-mean'> {
  constructor(page: Page) {
    super(page, 'atomic-did-you-mean');
  }

  async withAutomaticQueryCorrection() {
    await this.page.route(
      '**/search/v2?organizationId=searchuisamples',
      async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body.queryCorrection = {
          correctedQuery: 'coveo',
          originalQuery: 'coveoo',
          corrections: [],
        };
        await route.fulfill({
          response,
          json: body,
        });
      }
    );

    return this;
  }

  async withoutAutomaticQueryCorrection() {
    await this.page.route(
      '**/search/v2?organizationId=searchuisamples',
      async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body.queryCorrection = {
          corrections: [
            {
              correctedQuery: 'coveo',
              wordCorrections: [
                {
                  offset: 0,
                  length: 5,
                  originalWord: 'ceveo',
                  correctedWord: 'coveo',
                },
              ],
            },
          ],
        };
        await route.fulfill({
          response,
          json: body,
        });
      }
    );

    return this;
  }
}
