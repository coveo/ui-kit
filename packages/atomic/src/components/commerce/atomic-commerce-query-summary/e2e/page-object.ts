import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class QuerySummaryPageObject extends BasePageObject<'atomic-commerce-query-summary'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-query-summary');
  }
  querySummary({
    indexOfFirstResult,
    indexOfLastResults,
    totalResults,
  }: Record<string, number | undefined>) {
    return this.page.getByText(
      new RegExp(
        `Results ${indexOfFirstResult ?? '[\\d,]?'}-${indexOfLastResults ?? '[\\d,]?'} of ${totalResults ?? '[\\d,]?'}`
      )
    );
  }
}
