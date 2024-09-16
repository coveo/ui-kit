import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {AtomicFoldedResultListPageObject as FoldedResultList} from './page-object';

type Fixture = {
  foldedResultList: FoldedResultList;
};

export const test = base.extend<Fixture & AxeFixture>({
  makeAxeBuilder,
  foldedResultList: async ({page}, use) => {
    await use(new FoldedResultList(page));
  },
});

export {expect} from '@playwright/test';
