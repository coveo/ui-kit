/* eslint-disable @cspell/spellchecker */

import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

/**
 * Page object for atomic-did-you-mean E2E tests
 */
export class DidYouMeanPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-did-you-mean');
  }
}
