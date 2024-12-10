import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {UserActionsToggleObject} from './pageObject';
import {exampleUserActionsData} from './data';

const pageUrl = 's/quantic-user-actions-toggle';

interface UserActionsToggleOptions {
  userId: string;
  ticketCreationDateTime: string;
}
type QuanticUserActionsToggleE2EFixtures = {
  userActionsToggle: UserActionsToggleObject;
  options: UserActionsToggleOptions;
};

export const testInsight =
  quanticBase.extend<QuanticUserActionsToggleE2EFixtures>({
    options: {
      userId: 'someone@company.com',
      ticketCreationDateTime: '2024-01-01T00:00:00Z',
    },
    userActionsToggle: async ({page, options, configuration}, use) => {
      await page.goto(pageUrl);
      configuration.configure({...options});
      const userActionsToggleObject = new UserActionsToggleObject(page);
      userActionsToggleObject.mockUserActions(exampleUserActionsData);
      await userActionsToggleObject.waitForUserActionsResponse(options.userId);
      await use(userActionsToggleObject);
    },
  });

export {expect} from '@playwright/test';
