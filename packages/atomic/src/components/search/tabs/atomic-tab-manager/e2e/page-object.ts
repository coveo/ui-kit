import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class TabManagerPageObject extends BasePageObject<'atomic-tab-manager'> {
  constructor(page: Page) {
    super(page, 'atomic-tab-manager');
  }

  get placeholders() {
    return this.page.locator('atomic-tab-manager-placeholder');
  }

  get tabDropdown() {
    return this.page.locator('atomic-tab-manager .dropdown-area select');
  }

  get tabsArea() {
    return this.page.locator('atomic-tab-manager .tabs-area');
  }

  get activeTab() {
    return this.page.locator('atomic-tab-manager .active-tab button');
  }

  get excludedFacet() {
    return this.page.getByTestId('excluded-facet');
  }

  get includedFacet() {
    return this.page.getByTestId('included-facet');
  }

  tabButtons(value?: string) {
    const baseLocator = this.page.locator('[part="tab-button"]');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  tabDropdownOptions(value?: string) {
    const baseLocator = this.page.locator(
      'atomic-tab-manager .dropdown-area option'
    );
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  atomicTabElements() {
    return this.page.locator('atomic-tab');
  }
}
