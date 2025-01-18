import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {AtomicResultExample} from './page-object';

interface TestFixture {
  resultExample: AtomicResultExample;
}
export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  resultExample: async ({page}, use) => {
    await use(new AtomicResultExample(page));
  },
});
export {expect} from '@playwright/test';
