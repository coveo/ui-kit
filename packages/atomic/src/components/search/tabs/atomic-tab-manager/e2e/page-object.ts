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

  get activeTab() {
    return this.page.locator('atomic-tab-manager [aria-current="true"]');
  }

  get excludedFacet() {
    return this.page.getByLabel(/^excluded-facet$/);
  }

  get includedFacet() {
    return this.page.getByLabel(/^included-facet$/);
  }
  get excludedModalFacet() {
    return this.page
      .locator('atomic-refine-modal')
      .getByLabel(/^excluded-facet$/);
  }

  get includedModalFacet() {
    return this.page
      .locator('atomic-refine-modal')
      .getByLabel(/^included-facet$/);
  }

  get smartSnippet() {
    return this.page.getByText('Creating an In-Product Experience (IPX)');
  }

  get sortDropdown() {
    return this.page.getByRole('combobox', {name: 'Sort by'});
  }

  get sortDropdownOptions() {
    return this.page.getByLabel('Sort by').getByRole('option');
  }

  get refineModalSortDropdownOptions() {
    return this.page
      .locator('atomic-modal [part="select-wrapper"]')
      .getByLabel('Sort by')
      .getByRole('option');
  }

  get refineModalButton() {
    return this.page.getByRole('button', {name: 'Sort & Filter'});
  }

  get refineModalHeader() {
    return this.page.getByRole('heading', {name: 'Sort & Filter'});
  }

  get includedResultList() {
    return this.page.getByTestId('included-result-list');
  }
  get excludedResultList() {
    return this.page.getByTestId('excluded-result-list');
  }

  tabButtons(value?: string) {
    const baseLocator = this.page.getByLabel(/tab for .*/);
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
