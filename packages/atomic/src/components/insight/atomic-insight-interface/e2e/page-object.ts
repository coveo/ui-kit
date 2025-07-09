import {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class InsightInterfacePageObject extends BasePageObject<'atomic-insight-interface'> {
  constructor(page: Page) {
    super(page, 'atomic-insight-interface');
  }

  get insightInterface() {
    return this.page.getByTestId('root-interface');
  }

  get insightTabs() {
    return this.page.locator('atomic-insight-tab');
  }

  get insightQuerySummary() {
    return this.page.locator('atomic-insight-query-summary');
  }

  get insightSearchBox() {
    return this.page.locator('atomic-insight-search-box');
  }

  get insightRefineToggle() {
    return this.page.locator('atomic-insight-refine-toggle');
  }

  get insightUserActionsToggle() {
    return this.page.locator('atomic-insight-user-actions-toggle');
  }

  get insightPager() {
    return this.page.locator('atomic-insight-pager');
  }

  get insightPagerButtons() {
    return this.insightPager.getByRole('radio');
  }

  get insightResults() {
    return this.page.locator('atomic-insight-result');
  }

  get atomicQuickviewModal() {
    return this.page.locator('.atomic-quickview-modal');
  }

  get quickviewModalCloseButton() {
    return this.atomicQuickviewModal.getByRole('button', {name: 'Close'});
  }

  get insightRefineModal() {
    return this.page.locator('atomic-insight-refine-modal');
  }

  get insightRefineModalCloseButton() {
    return this.insightRefineModal.getByRole('button', {name: 'Close'});
  }

  async waitForResults() {
    await this.insightResults.first().waitFor({state: 'visible'});
  }

  getTabByName(name: string) {
    return this.insightTabs.filter({
      hasText: name,
    });
  }

  get connectResultLink() {
    return this.insightResults.getByRole('link', {name: 'Connect'});
  }

  async waitForNonVideoResultsToBeDetached() {
    await this.connectResultLink.waitFor({state: 'detached'});
  }

  getResultByIndex(index: number) {
    return this.insightResults.nth(index);
  }

  async hoverResultByIndex(index: number) {
    await this.getResultByIndex(index).hover();
  }

  getActionBarByIndex(index: number) {
    return this.getResultByIndex(index).locator(
      'atomic-insight-result-action-bar'
    );
  }

  getResultAttachToCaseByIndex(index: number) {
    return this.getResultByIndex(index).locator(
      'atomic-insight-result-attach-to-case-action'
    );
  }

  getResultCopyToClipboardByIndex(index: number) {
    return this.getResultByIndex(index).locator(
      'atomic-insight-result-action[action="copyToClipboard"]'
    );
  }

  getResultQuickviewByIndex(index: number) {
    return this.getResultByIndex(index).locator(
      'atomic-insight-result-quickview-action'
    );
  }

  async openResultQuickviewByIndex(index: number) {
    await this.getResultQuickviewByIndex(index).click();
  }

  async openRefineModal() {
    await this.insightRefineToggle.click();
  }
}
