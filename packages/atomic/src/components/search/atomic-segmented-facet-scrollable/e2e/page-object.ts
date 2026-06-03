import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SegmentedFacetScrollablePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-segmented-facet-scrollable');
  }

  get component() {
    return this.page.locator('atomic-segmented-facet-scrollable');
  }

  get scrollableContainer() {
    return this.hydrated.locator('[part="scrollable-container"]');
  }

  get horizontalScroll() {
    return this.hydrated.locator('[part="horizontal-scroll"]');
  }

  get leftArrowWrapper() {
    return this.hydrated.locator('[part="left-arrow-wrapper"]');
  }

  get rightArrowWrapper() {
    return this.hydrated.locator('[part="right-arrow-wrapper"]');
  }

  get leftArrowButton() {
    return this.hydrated.locator('[part="left-arrow-button"]');
  }

  get rightArrowButton() {
    return this.hydrated.locator('[part="right-arrow-button"]');
  }

  get leftArrowIcon() {
    return this.hydrated.locator('[part="left-arrow-icon"]');
  }

  get rightArrowIcon() {
    return this.hydrated.locator('[part="right-arrow-icon"]');
  }

  get leftFade() {
    return this.hydrated.locator('[part="left-fade"]');
  }

  get rightFade() {
    return this.hydrated.locator('[part="right-fade"]');
  }

  get segmentedFacets() {
    return this.component.locator('atomic-segmented-facet');
  }

  async isLeftArrowVisible() {
    return await this.leftArrowWrapper.isVisible();
  }

  async isRightArrowVisible() {
    return await this.rightArrowWrapper.isVisible();
  }

  async clickLeftArrow() {
    await this.leftArrowButton.click();
  }

  async clickRightArrow() {
    await this.rightArrowButton.click();
  }

  async getScrollPosition() {
    return await this.horizontalScroll.evaluate((el: Element) => {
      return (el as HTMLElement).scrollLeft;
    });
  }

  async isScrollable() {
    return await this.horizontalScroll.evaluate((el: Element) => {
      const element = el as HTMLElement;
      return element.scrollWidth > element.clientWidth;
    });
  }
}
