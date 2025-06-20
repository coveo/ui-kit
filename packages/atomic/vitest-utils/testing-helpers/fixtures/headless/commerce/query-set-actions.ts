import type {loadQuerySetActions} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultMockedActions = {
  registerQuerySetQuery: vi.fn() as unknown as ReturnType<
    typeof loadQuerySetActions
  >['registerQuerySetQuery'],
  updateQuerySetQuery: vi.fn() as unknown as ReturnType<
    typeof loadQuerySetActions
  >['updateQuerySetQuery'],
};

defaultMockedActions satisfies ReturnType<typeof loadQuerySetActions>;

export const buildFakeLoadQuerySetActions = (
  returnValues: Partial<
    ReturnType<typeof loadQuerySetActions>
  > = defaultMockedActions
) => ({...defaultMockedActions, ...returnValues});
