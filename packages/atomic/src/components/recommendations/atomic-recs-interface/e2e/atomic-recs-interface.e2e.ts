import {test, expect} from './fixture';

test.describe('before being initialized', () => {
  test('should return error if request is executed', async ({
    page,
    recsInterface,
  }) => {
    await recsInterface.load({story: 'recs-before-init'});

    const errorMessage = await page.waitForEvent('console', (msg) => {
      return msg.type() === 'error';
    });

    expect(errorMessage.text()).toContain(
      'You have to call "initialize" on the atomic-recs-interface component before modifying the props or calling other public methods.'
    );
  });
});
