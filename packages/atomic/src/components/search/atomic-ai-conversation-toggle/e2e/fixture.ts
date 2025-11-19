import {test as base} from '@playwright/test';
import {AtomicAiConversationTogglePageObject} from './page-object';

type Fixtures = {
  aiConversationToggle: AtomicAiConversationTogglePageObject;
};

export const test = base.extend<Fixtures>({
  aiConversationToggle: async ({page}, use) => {
    await use(new AtomicAiConversationTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
