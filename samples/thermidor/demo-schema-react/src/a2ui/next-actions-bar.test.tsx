import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import type {NextActionsBarProps} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

afterEach(cleanup);

function mountControl<TProps extends object>(component: string, state: TProps) {
  return mountSurface({
    component: {
      component,
      ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
    },
    dataModel: (Object.keys(state) as Array<keyof TProps>).map((key) => ({
      path: `/state/root/${String(key)}`,
      value: state[key],
    })),
  });
}

describe('NextActionsBar', () => {
  const state: NextActionsBarProps = {
    suggestedActions: [
      {text: 'Show me wetsuits', type: 'search'},
      {text: 'Compare these', type: 'followup'},
      {text: 'Saved search', type: 'searchOption', optionId: 'opt-1'},
    ],
  };

  it('dispatches selectAction for a follow-up or a search suggestion', async () => {
    const {lastAction} = mountControl('NextActionsBar', state);

    await waitFor(() => expect(screen.getByText('Compare these')).toBeDefined());
    fireEvent.click(screen.getByText('Compare these'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectAction',
        context: {text: 'Compare these', type: 'followup'},
      })
    );
  });

  it('dispatches selectSearchOption for a saved search option', async () => {
    const {lastAction} = mountControl('NextActionsBar', state);

    await waitFor(() => expect(screen.getByText('Saved search')).toBeDefined());
    fireEvent.click(screen.getByText('Saved search'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectSearchOption', context: {optionId: 'opt-1'}})
    );
  });
});
