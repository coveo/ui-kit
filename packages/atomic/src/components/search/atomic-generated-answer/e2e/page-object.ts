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

  get citationPopovers() {
    return this.page.locator('atomic-citation [part="citation-popover"]');
  }

  get answerContent() {
    return this.page.locator('atomic-generated-answer [part="answer-content"]');
  }

  get listItems() {
    return this.page
      .locator('atomic-generated-answer')
      .locator('[part="answer-list-item"]');
  }

  get codeBlocks() {
    return this.page
      .locator('atomic-generated-answer')
      .locator('[part="answer-code-block"]');
  }

  get tables() {
    return this.page
      .locator('atomic-generated-answer')
      .locator('[part="answer-table"]');
  }

  async waitForCitations() {
    await this.citation.first().waitFor();
  }

  async waitForListItems() {
    await this.listItems.first().waitFor();
  }

  async waitForCodeBlocks() {
    await this.codeBlocks.first().waitFor();
  }

  async waitForTables() {
    await this.tables.first().waitFor();
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

  async getListItemTexts(): Promise<string[]> {
    return await this.listItems.allTextContents();
  }

  async getListItemCount(): Promise<number> {
    return await this.listItems.count();
  }

  async getCodeBlockCount(): Promise<number> {
    return await this.codeBlocks.count();
  }

  async getCodeBlockTexts(): Promise<string[]> {
    return await this.codeBlocks.allTextContents();
  }

  async getTableCount(): Promise<number> {
    return await this.tables.count();
  }

  async getTableTexts(): Promise<string[]> {
    return await this.tables.allTextContents();
  }

  async getCitationPopover(index: number = 0) {
    return this.citationPopovers.nth(index);
  }

  async isCitationPopoverVisible(index: number = 0): Promise<boolean> {
    const popover = await this.getCitationPopover(index);
    return await popover.isVisible();
  }

  async getCitationPopoverText(index: number = 0): Promise<string> {
    const popover = await this.getCitationPopover(index);
    return (await popover.textContent()) || '';
  }
}
