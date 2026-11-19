import type {PropsWithChildren} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, screen, waitFor, within} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';
import {TurnFailedContext} from './ProgressBlock.js';

afterEach(() => cleanup());

function mountProgress(steps: unknown, status: string, {turnFailed = false} = {}) {
  return mountSurface({
    component: {
      component: 'ProgressBlock',
      steps: {path: '/state/root/steps'},
      status: {path: '/state/root/status'},
    },
    dataModel: [
      {path: '/state/root/steps', value: steps},
      {path: '/state/root/status', value: status},
    ],
    wrapper: ({children}: PropsWithChildren) => (
      <TurnFailedContext.Provider value={turnFailed}>{children}</TurnFailedContext.Provider>
    ),
  });
}

function rows() {
  const list = screen.getByRole('list', {name: 'Agent progress'});
  return within(list)
    .getAllByRole('listitem')
    .map((item) => [item.textContent, item.getAttribute('data-state')]);
}

describe('ProgressBlock', () => {
  it('ticks done steps and shows the active one', async () => {
    mountProgress(
      [
        {id: 'thinking', label: 'Thinking', status: 'done'},
        {id: 'comparing_products', label: 'Comparing products', status: 'active'},
      ],
      'running'
    );

    await waitFor(() =>
      expect(rows()).toEqual([
        ['Thinking (done)', 'done'],
        ['Comparing products (in progress)', 'active'],
      ])
    );
  });

  it('shows several active steps at once, in the order they started', async () => {
    mountProgress(
      [
        {id: 'thinking', label: 'Thinking', status: 'done'},
        {id: 'checking_details', label: 'Checking product details', status: 'active'},
        {id: 'reading_reviews', label: 'Reading reviews', status: 'active'},
      ],
      'running'
    );

    await waitFor(() =>
      expect(rows()).toEqual([
        ['Thinking (done)', 'done'],
        ['Checking product details (in progress)', 'active'],
        ['Reading reviews (in progress)', 'active'],
      ])
    );
  });

  it('grows in place as updates arrive, and ends with every step ticked', async () => {
    const {pushDataModel} = mountProgress(
      [{id: 'thinking', label: 'Thinking', status: 'active'}],
      'running'
    );
    await waitFor(() => expect(rows()).toEqual([['Thinking (in progress)', 'active']]));
    const list = screen.getByRole('list', {name: 'Agent progress'});

    pushDataModel([
      {
        path: '/state/root/steps',
        value: [
          {id: 'thinking', label: 'Thinking', status: 'done'},
          {id: 'preparing_response', label: 'Putting it together', status: 'done'},
        ],
      },
      {path: '/state/root/status', value: 'complete'},
    ]);

    await waitFor(() =>
      expect(rows()).toEqual([
        ['Thinking (done)', 'done'],
        ['Putting it together (done)', 'done'],
      ])
    );
    expect(screen.getByRole('list', {name: 'Agent progress'})).toBe(list);
  });

  it('renders the label of a step id it does not know', async () => {
    mountProgress(
      [{id: 'comparing_reviews', label: 'Comparing reviews', status: 'active'}],
      'running'
    );

    await waitFor(() => expect(rows()).toEqual([['Comparing reviews (in progress)', 'active']]));
  });

  it('marks the active steps failed when the block ends in error', async () => {
    mountProgress(
      [
        {id: 'thinking', label: 'Thinking', status: 'done'},
        {id: 'searching_products', label: 'Searching the catalog', status: 'active'},
      ],
      'error'
    );

    await waitFor(() =>
      expect(rows()).toEqual([
        ['Thinking (done)', 'done'],
        ['Searching the catalog (failed)', 'failed'],
      ])
    );
  });

  it('marks the active steps failed when its turn failed while the block was running', async () => {
    mountProgress(
      [
        {id: 'thinking', label: 'Thinking', status: 'done'},
        {id: 'searching_products', label: 'Searching the catalog', status: 'active'},
      ],
      'running',
      {turnFailed: true}
    );

    await waitFor(() =>
      expect(rows()).toEqual([
        ['Thinking (done)', 'done'],
        ['Searching the catalog (failed)', 'failed'],
      ])
    );
  });

  it('keeps the active step running while its turn is fine', async () => {
    mountProgress(
      [{id: 'searching_products', label: 'Searching the catalog', status: 'active'}],
      'running'
    );

    await waitFor(() =>
      expect(rows()).toEqual([['Searching the catalog (in progress)', 'active']])
    );
  });
});
