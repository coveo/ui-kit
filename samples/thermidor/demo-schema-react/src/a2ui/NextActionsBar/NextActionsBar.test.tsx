import {describe, expect, it, afterEach} from 'vitest';
import {screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * NextActionsBar is a `createReactComponent` implementation driven by the generic binder, mounted
 * end-to-end through the real thermidor catalog: `suggestedActions` is a `{path}` binding resolved
 * from the surface data model. A `searchOption` item is a search the gateway saved for an agent
 * answer; the browser only holds its `optionId`.
 */

afterEach(() => cleanup());

const OPTION_ID = 'opt-7f3e1c2a-4b5d-4e6f-8a9b-0c1d2e3f4a5b';

const ACTIONS = [
  {text: 'Compare the top two', type: 'followup'},
  {text: 'trail running shoes', type: 'search'},
  {text: 'Salomon trail shoes', type: 'searchOption', optionId: OPTION_ID},
];

function mountNextActionsBar() {
  return mountSurface({
    component: {
      component: 'NextActionsBar',
      suggestedActions: {path: '/state/root/suggestedActions'},
    },
    dataModel: [{path: '/state/root/suggestedActions', value: ACTIONS}],
  });
}

describe('NextActionsBar', () => {
  it('renders one button per suggested action', async () => {
    mountNextActionsBar();

    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(3));
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Compare the top two',
      'trail running shoes',
      'Salomon trail shoes',
    ]);
  });

  it('dispatches selectAction for a followup or search item', async () => {
    const {actions} = mountNextActionsBar();

    await waitFor(() => expect(screen.queryByText('trail running shoes')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', {name: 'Compare the top two'}));
    // The bar is disabled while its own dispatch is outstanding.
    const search = screen.getByRole('button', {name: 'trail running shoes'}) as HTMLButtonElement;
    await waitFor(() => expect(search.disabled).toBe(false));
    fireEvent.click(search);

    await waitFor(() => expect(actions).toHaveLength(2));
    expect(actions.map(({name, context}) => ({name, context}))).toEqual([
      {name: 'selectAction', context: {text: 'Compare the top two', type: 'followup'}},
      {name: 'selectAction', context: {text: 'trail running shoes', type: 'search'}},
    ]);
  });

  it('dispatches selectSearchOption with the option id for a searchOption item', async () => {
    const {lastAction} = mountNextActionsBar();

    await waitFor(() => expect(screen.queryByText('Salomon trail shoes')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', {name: 'Salomon trail shoes'}));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectSearchOption',
        sourceComponentId: 'root',
        context: {optionId: OPTION_ID},
      })
    );
  });
});
