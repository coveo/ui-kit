import type {Page} from '@playwright/test';
import {buildArgsParam} from 'storybook/internal/router';

type Component = Record<string, unknown>;

export class BasePageObject {
  constructor(
    public page: Page,
    public tag: string
  ) {}

  get urlRoot() {
    return './iframe.html';
  }

  get hydrated() {
    return this.page.locator(`${this.tag}`);
  }

  async load({
    args,
    story = 'default',
  }: {
    args?: Record<string, unknown>;
    story?: string;
  } = {}) {
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
    return this.nRecommendations(0);
  }

  async nRecommendations(numberOfRecommendations?: number) {
    await this.page.route('**/commerce/v2/recommendations', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      if (numberOfRecommendations !== undefined) {
        body.products = body.products.slice(0, numberOfRecommendations);
      }
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
