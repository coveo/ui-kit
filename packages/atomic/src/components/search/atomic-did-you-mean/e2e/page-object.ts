/* eslint-disable @cspell/spellchecker */

import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class DidYouMeanPageObject extends BasePageObject<'atomic-did-you-mean'> {
  constructor(page: Page) {
    super(page, 'atomic-did-you-mean');
  }
}
