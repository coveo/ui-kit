import type {Page} from '@playwright/test';
import {buildArgsParam} from 'storybook/internal/router';
import type {JSX} from '../dist/types/components';

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
    return './iframe.html';
  }

  async load({
    args,
    story = 'default',
  }: {
    args?: Component;
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
