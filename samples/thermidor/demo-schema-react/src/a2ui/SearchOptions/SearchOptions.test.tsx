import {describe, expect, it, afterEach} from 'vitest';
import {screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * SearchOptions is a `createReactComponent` implementation driven by the generic binder, mounted
 * end-to-end through the real thermidor catalog: `items` is a `{path}` binding resolved from the
 * surface data model, as the agent emits it (`/state/<componentId>/items`) once the gateway has
 * stripped each option down to `{optionId, label}`.
 */

afterEach(() => cleanup());

const ITEMS = [
  {optionId: 'opt-7f3e1c2a-4b5d-4e6f-8a9b-0c1d2e3f4a5b', label: 'Salomon trail shoes'},
  {optionId: 'opt-0c1d2e3f-4a5b-4e6f-8a9b-7f3e1c2a4b5d', label: 'Waterproof under $150'},
];

function mountSearchOptions(items: unknown) {
  return mountSurface({
    component: {component: 'SearchOptions', items: {path: '/state/root/items'}},
    dataModel: [{path: '/state/root/items', value: items}],
  });
}

describe('SearchOptions', () => {
  it('renders one button per option, labelled with the option label', async () => {
    mountSearchOptions(ITEMS);

    await waitFor(() =>
      expect(screen.queryByRole('group', {name: 'Search options'})).not.toBeNull()
    );
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Salomon trail shoes',
      'Waterproof under $150',
    ]);
  });

  it('dispatches selectSearchOption with the tapped option id', async () => {
    const {lastAction} = mountSearchOptions(ITEMS);

    await waitFor(() => expect(screen.queryByText('Waterproof under $150')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', {name: 'Waterproof under $150'}));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectSearchOption',
        sourceComponentId: 'root',
        context: {optionId: 'opt-0c1d2e3f-4a5b-4e6f-8a9b-7f3e1c2a4b5d'},
      })
    );
  });

  it('renders nothing without options', async () => {
    mountSearchOptions([]);

    await waitFor(() => expect(screen.queryByRole('group', {name: 'Search options'})).toBeNull());
    expect(screen.queryByRole('button')).toBeNull();
  });
});
