import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class TabManagerPageObject extends BasePageObject<'atomic-tab-manager'> {
  constructor(page: Page) {
    super(page, 'atomic-tab-manager');
  }

  get tabDropdown() {
    return this.page.getByLabel('tab-dropdown-area').getByRole('combobox');
  }

  get tabArea() {
    return this.page.getByLabel('tab-area');
  }

  get excludedFacet() {
    return this.page.getByTestId('excluded-facet');
  }

  get includedFacet() {
    return this.page.getByTestId('included-facet');
  }

  get smartSnippet() {
    return this.page.locator('atomic-smart-snippet [part="smart-snippet"]');
  }

  tabButtons(value?: string) {
    const baseLocator = this.page.getByRole('listitem');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  tabDropdownOptions(value?: string) {
    const baseLocator = this.page
      .getByLabel('tab-dropdown-area')
      .getByRole('option');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  atomicTabElements() {
    return this.page.locator('atomic-tab');
  }
}
