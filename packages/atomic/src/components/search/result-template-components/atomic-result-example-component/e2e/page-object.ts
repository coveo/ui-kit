/* eslint-disable @cspell/spellchecker */
import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/lit-base-page-object';

export class AtomicResultExample extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-example-component');
  }
}
