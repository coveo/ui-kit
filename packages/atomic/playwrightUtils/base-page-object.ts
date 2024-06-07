import type {Page} from '@playwright/test';

export class BasePageObject<Component extends HTMLElementTagNameMap> {
  constructor(public page: Page) {
    //const a = global['HTMLElementTagNameMap'];
  }

  get hydrated() {
    return '';
    // return this.page.locator(`${this.tag}[class*="hydrated"]`);
  }

  goto(story: string = 'default') {
    this.page.goto(
      `http://localhost:4400/iframe.html?id=${this.tag}--${story}`
    );
  }

  gotoParametrized(story: string, args: keyof Component) {
    console.log(args);
    this.page.goto(
      `http://localhost:4400/iframe.html?id=${this.tag}--${story}}`
    );
  }
}
