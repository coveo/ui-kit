import AxeBuilder from '@axe-core/playwright';
import type {test as base} from '@playwright/test';

export type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const makeAxeBuilder: Parameters<
  typeof base.extend<AxeFixture>
>[0]['makeAxeBuilder'] = async ({page}, use) => {
  const makeAxeBuilder = () =>
    new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#code-root');

  await use(makeAxeBuilder);
};
