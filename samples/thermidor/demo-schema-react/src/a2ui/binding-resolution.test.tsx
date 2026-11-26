import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {mountSurface} from './mount-surface.harness.js';

/**
 * REGRESSION — runtime binding resolution through `@a2ui/react` and the real thermidor catalog.
 *
 * This drives the whole A2-UI v1.0 pipeline: a `createSurface` carrying `{'@path'}` bindings and
 * `updateDataModel` writes to `/state/<id>/...`. The binder classifies each catalog prop field
 * from its `XxxPropsSchema` (`@coveo/thermidor-schema/zod3`) and resolves the binding before the
 * component renders. An unresolved binding would reach `NextActionsBar` as an object, and it would
 * throw `actions.map is not a function`.
 *
 * Covered:
 *  - an array `{'@path'}` binding: NextActionsBar `suggestedActions` resolves to an action array;
 *  - scalar `{'@path'}` bindings: QuerySummary `query` / `totalEntries` resolve to string/number;
 *  - a container: LayoutStack (root) mounts its child-ref list, driving the two above.
 */

const ACTIONS_ID = 'next_actions';
const SUMMARY_ID = 'query_summary';

describe('Regression — the binder resolves {"@path"} bindings through the real thermidor catalog', () => {
  it('resolves NextActionsBar `suggestedActions` (array binding), QuerySummary scalars, and a container child-ref list', async () => {
    mountSurface({
      component: {
        component: 'LayoutStack',
        direction: 'column',
        children: [ACTIONS_ID, SUMMARY_ID],
      },
      children: [
        {
          id: ACTIONS_ID,
          component: 'NextActionsBar',
          suggestedActions: {'@path': `/state/${ACTIONS_ID}/suggestedActions`},
        },
        {
          id: SUMMARY_ID,
          component: 'QuerySummary',
          query: {'@path': `/state/${SUMMARY_ID}/query`},
          firstIndex: {'@path': `/state/${SUMMARY_ID}/firstIndex`},
          lastIndex: {'@path': `/state/${SUMMARY_ID}/lastIndex`},
          totalEntries: {'@path': `/state/${SUMMARY_ID}/totalEntries`},
        },
      ],
      dataModel: [
        {
          path: `/state/${ACTIONS_ID}/suggestedActions`,
          value: [
            {text: 'Add fins', type: 'followup'},
            {text: 'Compare boards', type: 'search'},
          ],
        },
        {path: `/state/${SUMMARY_ID}/query`, value: 'surfboards'},
        {path: `/state/${SUMMARY_ID}/firstIndex`, value: 1},
        {path: `/state/${SUMMARY_ID}/lastIndex`, value: 12},
        {path: `/state/${SUMMARY_ID}/totalEntries`, value: 43},
      ],
    });

    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());

    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Add fins'})).toBeDefined();
    });
    expect(screen.getByRole('button', {name: 'Compare boards'})).toBeDefined();

    const summary = screen.getByText(/Products/);
    expect(summary.textContent).toContain('surfboards');
    expect(summary.textContent).toContain('43');
  });
});
