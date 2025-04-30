import {userEvent} from '@vitest/browser/context';
import {describe, test} from 'vitest';

describe('bla', () => {
  test('boom', async () => {
    await userEvent.click(document.querySelector('body')!);
  });
});
