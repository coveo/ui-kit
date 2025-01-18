/* eslint-disable @cspell/spellchecker */
import {test, expect} from './fixture';

test.describe('with an automatic query correction', () => {
  test.beforeEach(async ({resultExample}) => {
    await resultExample.load();
  });

  test('result example should display its name', ({resultExample}) => {
    expect(resultExample.hydrated).toContainText('Hello, World!');
  });
});
