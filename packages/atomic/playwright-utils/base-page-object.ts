import type {Page} from '@playwright/test';
import {buildArgsParam} from '@storybook/router';
import {JSX} from '../dist/types/components';

export class BasePageObject<
  TagName extends keyof JSX.IntrinsicElements,
  Component = JSX.IntrinsicElements[TagName],
> {
  constructor(
    public page: Page,
    public tag: TagName
  ) {}

  get hydrated() {
    return this.page.locator(`${this.tag}[class*="hydrated"]`);
  }

  get urlRoot() {
    return 'http://localhost:4400/iframe.html';
  }

  async load({
    args,
    story = 'default',
  }: {args?: Component; story?: string} = {}) {
    if (args) {
      await this.page.goto(
        `${this.urlRoot}?id=${this.tag}--${story}&args=${buildArgsParam(undefined, this.camelToKebab(args))}`
      );
    } else {
      await this.page.goto(`${this.urlRoot}?id=${this.tag}--${story}`);
    }
  }

  async noProducts() {
    await this.page.route('**/commerce/v2/search', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products = [];
      if (body.pagination) {
        body.pagination.totalEntries = 0;
        body.pagination.totalPages = 0;
      }
      body.facets = [];
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }

  async noRecommendations() {
    await this.page.route('**/commerce/v2/recommendations', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products = [];
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }

  private camelToKebab(args: Component) {
    const toKebab: Record<string, unknown> = {};
    Object.entries(args as Record<string, unknown>).forEach(([key, value]) => {
      toKebab[
        `attributes-${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`
      ] = value;
    });

    return toKebab;
  }
}
