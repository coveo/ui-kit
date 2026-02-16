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

  private camelToKebab(args: Component) {
    const toKebab: Record<string, unknown> = {};
    Object.entries(args as Record<string, unknown>).forEach(([key, value]) => {
      toKebab[
        `${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`
      ] = value;
    });

    return toKebab;
  }
}
