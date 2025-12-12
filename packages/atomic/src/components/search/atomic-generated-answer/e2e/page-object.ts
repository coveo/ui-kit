import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

interface AtomicCitationElement extends HTMLElement {
  citation?: GeneratedAnswerCitation;
}

export class GeneratedAnswerPageObject extends BasePageObject<'atomic-generated-answer'> {
  constructor(page: Page) {
    super(page, 'atomic-generated-answer');
  }

  get citationComponents() {
    return this.page.locator('atomic-citation');
  }

  get citation() {
    return this.page.locator('atomic-citation [part="citation"]');
  }

  get citationPopover() {
    return this.page.locator('atomic-citation [part="citation-popover"]');
  }

  async waitForCitations() {
    await this.citation.first().waitFor();
  }

  async getCitationCount(): Promise<number> {
    return await this.citation.count();
  }

  async getCitationHref(index: number = 0): Promise<string | null> {
    return await this.citation.nth(index).getAttribute('href');
  }

  async getCitationFiletype(index: number = 0): Promise<string | null> {
    const citationComponent = this.citationComponents.nth(index);

    return await citationComponent.evaluate((citationElement) => {
      return (
        (citationElement as AtomicCitationElement).citation?.fields?.filetype ??
        null
      );
    });
  }
}
