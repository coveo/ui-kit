import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {Page} from '@playwright/test';

interface AtomicCitationElement extends HTMLElement {
  citation?: GeneratedAnswerCitation;
}

export class InsightGeneratedAnswerPageObject {
  constructor(public page: Page) {}

  get generatedAnswer() {
    return this.page.locator('atomic-insight-generated-answer');
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

  async load({story}: {story: string}) {
    await this.page.goto(
      `/iframe.html?id=atomic-insight-generated-answer--${story}&viewMode=story`
    );
  }

  async hydrated() {
    return this.generatedAnswer.waitFor({state: 'attached'});
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
