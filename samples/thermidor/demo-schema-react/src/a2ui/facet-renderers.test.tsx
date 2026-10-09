import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor, act} from '@testing-library/react';
import type {
  RegularFacetProps,
  NumericFacetProps,
  CategoryFacetProps,
} from '@coveo/thermidor-schema/zod3';
import {mountSurface} from './mount-surface.harness.js';

/**
 * The facet components are `createReactComponent` implementations driven by the generic binder,
 * mounted end-to-end through the real thermidor catalog: resolved state is written to the surface
 * data model via `{path}` bindings, and every gesture dispatches an action that surfaces
 * (unwrapped) on `lastAction()` as `{name, context}`. FacetManager mounts its ordered children by
 * id via `buildChild`; the tests assert the observable mounted DOM order.
 */

afterEach(() => cleanup());

function expectEveryControlDisabled(container: HTMLElement) {
  const controls = [...container.querySelectorAll('button, input, select')];
  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    expect(control.matches(':disabled'), control.outerHTML).toBe(true);
  }
}

// jsdom still toggles a disabled checkbox on a synthetic click, so only buttons are clicked.
function clickEveryButton(container: HTMLElement) {
  for (const button of container.querySelectorAll('button')) {
    fireEvent.click(button);
  }
}

describe('RegularFacet', () => {
  const stateWithValues: RegularFacetProps = {
    field: 'ec_brand',
    displayName: 'Brand',
    hasActiveValues: true,
    canShowMoreValues: true,
    canShowLessValues: false,
    values: [
      {value: 'Billabong', numberOfResults: 4, state: 'idle'},
      {value: 'Quiksilver', numberOfResults: 2, state: 'selected'},
    ],
    facetSearch: {query: '', canShowMoreResults: false, results: []},
  };

  const BINDINGS = {
    field: {path: '/state/root/field'},
    displayName: {path: '/state/root/displayName'},
    hasActiveValues: {path: '/state/root/hasActiveValues'},
    canShowMoreValues: {path: '/state/root/canShowMoreValues'},
    canShowLessValues: {path: '/state/root/canShowLessValues'},
    values: {path: '/state/root/values'},
    facetSearch: {path: '/state/root/facetSearch'},
  };

  function mountFacet(
    state: RegularFacetProps,
    dispatchGate?: () => Promise<void> | void,
    readOnly?: boolean
  ) {
    return mountSurface({
      component: {component: 'RegularFacet', ...BINDINGS},
      dispatchGate,
      readOnly,
      dataModel: (Object.keys(state) as Array<keyof RegularFacetProps>).map((key) => ({
        path: `/state/root/${key}`,
        value: state[key],
      })),
    });
  }

  it('dispatches toggleSelect when a value control is clicked', async () => {
    const {lastAction} = mountFacet(stateWithValues);

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    fireEvent.click(screen.getByTestId('facet-value-Billabong'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'toggleSelect', context: {value: 'Billabong'}})
    );
  });

  it('optimistically checks the clicked value before the backend reconciles', async () => {
    // The intent only stands while its dispatch is outstanding.
    let answer!: () => void;
    const pending = new Promise<void>((resolve) => (answer = resolve));
    mountFacet(stateWithValues, () => pending);

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
    expect(billabong.checked).toBe(false);
    fireEvent.click(billabong);
    await waitFor(() =>
      expect((screen.getByTestId('facet-value-Billabong') as HTMLInputElement).checked).toBe(true)
    );
    answer();
  });

  it('keeps a second selection through the snapshot answering the first', async () => {
    const bothIdle: RegularFacetProps = {
      ...stateWithValues,
      hasActiveValues: false,
      values: [
        {value: 'Billabong', numberOfResults: 4, state: 'idle'},
        {value: 'Quiksilver', numberOfResults: 2, state: 'idle'},
      ],
    };
    const answers: Array<() => void> = [];
    const {pushDataModel} = mountFacet(
      bothIdle,
      () => new Promise<void>((resolve) => answers.push(resolve))
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    fireEvent.click(screen.getByTestId('facet-value-Billabong'));
    fireEvent.click(screen.getByTestId('facet-value-Quiksilver'));
    // The coordinator holds the second click until the first is answered.
    await waitFor(() => expect(answers).toHaveLength(1));
    await waitFor(() =>
      expect((screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement).checked).toBe(true)
    );

    // The first answer is a whole-node snapshot that never saw the second click.
    await act(async () => {
      answers[0]!();
      await Promise.resolve();
    });
    pushDataModel([
      {
        path: '/state/root/values',
        value: [
          {value: 'Billabong', numberOfResults: 4, state: 'selected'},
          {value: 'Quiksilver', numberOfResults: 2, state: 'idle'},
        ],
      },
    ]);

    expect((screen.getByTestId('facet-value-Billabong') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement).checked).toBe(true);

    await waitFor(() => expect(answers).toHaveLength(2));
    await act(async () => {
      answers[1]!();
      await Promise.resolve();
    });
    pushDataModel([
      {
        path: '/state/root/values',
        value: [
          {value: 'Billabong', numberOfResults: 4, state: 'selected'},
          {value: 'Quiksilver', numberOfResults: 2, state: 'selected'},
        ],
      },
    ]);

    await waitFor(() => {
      expect((screen.getByTestId('facet-value-Billabong') as HTMLInputElement).checked).toBe(true);
      expect((screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement).checked).toBe(true);
    });
  });

  it('lets the backend correct a selection once it has answered the click', async () => {
    const answers: Array<() => void> = [];
    const {pushDataModel} = mountFacet(
      stateWithValues,
      () => new Promise<void>((resolve) => answers.push(resolve))
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    fireEvent.click(screen.getByTestId('facet-value-Billabong'));
    await waitFor(() => expect(answers).toHaveLength(1));
    await waitFor(() =>
      expect((screen.getByTestId('facet-value-Billabong') as HTMLInputElement).checked).toBe(true)
    );

    pushDataModel([
      {
        path: '/state/root/values',
        value: [
          {value: 'Billabong', numberOfResults: 4, state: 'idle'},
          {value: 'Quiksilver', numberOfResults: 2, state: 'selected'},
        ],
      },
    ]);
    await act(async () => {
      answers[0]!();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect((screen.getByTestId('facet-value-Billabong') as HTMLInputElement).checked).toBe(false)
    );
  });

  it('renders values as checkboxes reflecting selection state', async () => {
    mountFacet(stateWithValues);

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
    const quiksilver = screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement;
    expect(billabong.type).toBe('checkbox');
    expect(billabong.checked).toBe(false);
    expect(quiksilver.checked).toBe(true);
  });

  it('dispatches clearAllActiveValues when the clear control is activated', async () => {
    const {lastAction} = mountFacet(stateWithValues);

    await waitFor(() => expect(screen.getByLabelText('Clear Brand selections')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Clear Brand selections'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'clearAllActiveValues', context: {}})
    );
  });

  it('renders a pinned selected value (from search) as a checked checkbox at the top', async () => {
    mountFacet({
      ...stateWithValues,
      values: [
        {value: 'Cressi', numberOfResults: 1, state: 'selected'},
        {value: 'Billabong', numberOfResults: 4, state: 'idle'},
        {value: 'Quiksilver', numberOfResults: 2, state: 'idle'},
      ],
    });

    await waitFor(() => expect(screen.getByTestId('facet-value-Cressi')).toBeDefined());
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].getAttribute('data-testid')).toBe('facet-value-Cressi');
    expect(checkboxes[0].checked).toBe(true);
  });

  it('dispatches search on each change and keeps the input responsive', async () => {
    const {actions} = mountFacet(stateWithValues);

    await waitFor(() => expect(screen.getByTestId('facet-search-input-ec_brand')).toBeDefined());
    const input = screen.getByTestId('facet-search-input-ec_brand') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'ri'}});
    fireEvent.change(input, {target: {value: 'rip'}});

    expect(input.value).toBe('rip');
    await waitFor(() => {
      const searches = actions.filter((a) => a.name === 'search');
      expect(searches.map((a) => a.context)).toEqual([{query: 'ri'}, {query: 'rip'}]);
    });
  });

  it('renders search results in place of the value list and dispatches toggleSelect on result click', async () => {
    const {lastAction} = mountFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'rip',
        canShowMoreResults: true,
        results: [
          {value: 'Rip Curl', numberOfResults: 3},
          {value: 'Cressi', numberOfResults: 1},
        ],
      },
    });

    await waitFor(() => expect(screen.getByTestId('facet-search-result-Rip Curl')).toBeDefined());
    expect(screen.queryByTestId('facet-value-Billabong')).toBeNull();

    fireEvent.click(screen.getByTestId('facet-search-result-Rip Curl'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'toggleSelect', context: {value: 'Rip Curl'}})
    );
  });

  it('renders a "More matches for" control that dispatches showMoreSearchResults', async () => {
    const {lastAction} = mountFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'i',
        canShowMoreResults: true,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    });

    await waitFor(() =>
      expect(screen.getByTestId('facet-search-show-more-ec_brand')).toBeDefined()
    );
    const showMore = screen.getByTestId('facet-search-show-more-ec_brand');
    expect(showMore.textContent).toBe('More matches for i');
    fireEvent.click(showMore);
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'showMoreSearchResults', context: {}})
    );
  });

  it('hides the "More matches for" control when canShowMoreResults is false', async () => {
    mountFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'i',
        canShowMoreResults: false,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    });

    await waitFor(() => expect(screen.getByTestId('facet-search-result-Rip Curl')).toBeDefined());
    expect(screen.queryByTestId('facet-search-show-more-ec_brand')).toBeNull();
  });

  it('dispatches clearSearch when the clear-search affordance is activated', async () => {
    const {lastAction} = mountFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'rip',
        canShowMoreResults: false,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    });

    await waitFor(() => expect(screen.getByLabelText('Clear Brand search')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Clear Brand search'));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'clearSearch', context: {}}));
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', async () => {
    const {lastAction} = mountFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: false,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-more-ec_brand')).toBeDefined());
    expect(screen.queryByTestId('facet-show-less-ec_brand')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-ec_brand'));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'showMoreValues', context: {}}));
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', async () => {
    const {lastAction} = mountFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-less-ec_brand')).toBeDefined());
    fireEvent.click(screen.getByTestId('facet-show-less-ec_brand'));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'showLessValues', context: {}}));
  });

  it('renders "- Show less" above "+ Show more" when both are available', async () => {
    const {container} = mountFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-less-ec_brand')).toBeDefined());
    const buttons = Array.from(
      container.querySelectorAll(
        '[data-testid="facet-show-less-ec_brand"], [data-testid="facet-show-more-ec_brand"]'
      )
    );
    expect(buttons.map((b) => b.getAttribute('data-testid'))).toEqual([
      'facet-show-less-ec_brand',
      'facet-show-more-ec_brand',
    ]);
  });

  it('shows neither show-more nor show-less when both flags are false', async () => {
    mountFacet({...stateWithValues, canShowMoreValues: false, canShowLessValues: false});

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
    expect(screen.queryByTestId('facet-show-more-ec_brand')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-ec_brand')).toBeNull();
  });

  describe('in a read-only surface', () => {
    it('disables the values, clear, search and show-more controls and dispatches nothing', async () => {
      const {container, actions} = mountFacet(stateWithValues, undefined, true);

      await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());
      expectEveryControlDisabled(container);
      clickEveryButton(container);
      expect(actions).toEqual([]);
    });

    it('disables the search results and "More matches for" control', async () => {
      const {container, actions} = mountFacet(
        {
          ...stateWithValues,
          facetSearch: {
            query: 'rip',
            canShowMoreResults: true,
            results: [{value: 'Rip Curl', numberOfResults: 3}],
          },
        },
        undefined,
        true
      );

      await waitFor(() =>
        expect(screen.getByTestId('facet-search-show-more-ec_brand')).toBeDefined()
      );
      expectEveryControlDisabled(container);
      clickEveryButton(container);
      expect(actions).toEqual([]);
    });
  });
});

describe('NumericFacet', () => {
  const stateWithRanges: NumericFacetProps = {
    field: 'ec_price',
    displayName: 'Price',
    hasActiveValues: false,
    canShowMoreValues: false,
    canShowLessValues: false,
    customRange: null,
    values: [
      {start: 0, end: 100, numberOfResults: 5, state: 'idle'},
      {start: 100, end: 200, numberOfResults: 2, state: 'idle'},
    ],
  };

  function mountFacet(
    state: NumericFacetProps,
    dispatchGate?: () => Promise<void> | void,
    readOnly?: boolean
  ) {
    return mountSurface({
      component: {
        component: 'NumericFacet',
        ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
      },
      dispatchGate,
      readOnly,
      dataModel: (Object.keys(state) as Array<keyof NumericFacetProps>).map((key) => ({
        path: `/state/root/${key}`,
        value: state[key],
      })),
    });
  }

  it('dispatches toggleSingleSelect with the range start/end when a listed range is clicked', async () => {
    const {lastAction} = mountFacet(stateWithRanges);

    await waitFor(() => expect(screen.getByText('$100 - $200')).toBeDefined());
    fireEvent.click(screen.getByText('$100 - $200'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'toggleSingleSelect',
        context: {start: 100, end: 200},
      })
    );
  });

  it('optimistically marks only the clicked range selected before the backend reconciles', async () => {
    // The intent only stands while its dispatch is outstanding.
    let answer!: () => void;
    const pending = new Promise<void>((resolve) => (answer = resolve));
    mountFacet(stateWithRanges, () => pending);

    await waitFor(() => expect(screen.getByText('$100 - $200')).toBeDefined());
    const clicked = screen.getByText('$100 - $200').closest('button')!;
    const other = screen.getByText('$0 - $100').closest('button')!;
    expect(clicked.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(clicked);
    await waitFor(() =>
      expect(screen.getByText('$100 - $200').closest('button')!.getAttribute('aria-pressed')).toBe(
        'true'
      )
    );
    expect(other.getAttribute('aria-pressed')).toBe('false');
    answer();
  });

  describe('replacing queued range selections', () => {
    const fourRanges: NumericFacetProps = {
      ...stateWithRanges,
      values: [
        {start: 0, end: 100, numberOfResults: 5, state: 'idle'},
        {start: 100, end: 200, numberOfResults: 4, state: 'idle'},
        {start: 200, end: 300, numberOfResults: 3, state: 'idle'},
        {start: 300, end: 400, numberOfResults: 2, state: 'idle'},
      ],
    };

    function mountHeld(state: NumericFacetProps) {
      const answers: Array<() => void> = [];
      const view = mountFacet(state, () => new Promise<void>((resolve) => answers.push(resolve)));
      return {
        ...view,
        starts: () => view.actions.map((action) => action.context?.['start']),
        release: async () => {
          await act(async () => {
            answers.shift()?.();
            await Promise.resolve();
          });
        },
      };
    }

    const clickRange = (label: string) =>
      fireEvent.click(screen.getByText(label).closest('button')!);

    it('sends only the last range of a descent, the first being already in flight', async () => {
      const view = mountHeld(fourRanges);
      await waitFor(() => expect(screen.getByText('$0 - $100')).toBeDefined());

      clickRange('$0 - $100');
      clickRange('$100 - $200');
      clickRange('$200 - $300');
      clickRange('$300 - $400');

      expect(view.starts()).toEqual([0]);
      await view.release();

      // Each queued selection is an absolute write of the same slot, so only the last survives.
      await waitFor(() => expect(view.starts()).toEqual([0, 300]));
    });

    it('sends nothing for a gesture the dispatch in flight already satisfies', async () => {
      const view = mountHeld(fourRanges);
      await waitFor(() => expect(screen.getByText('$0 - $100')).toBeDefined());

      clickRange('$0 - $100');
      clickRange('$100 - $200');
      clickRange('$200 - $300');
      // The in-flight dispatch already produces this state, so neither queued gesture goes out.
      clickRange('$0 - $100');

      // Still shown: held until the in-flight dispatch is answered.
      await waitFor(() =>
        expect(screen.getByText('$0 - $100').closest('button')!.getAttribute('aria-pressed')).toBe(
          'true'
        )
      );
      await view.release();

      await waitFor(() => expect(view.starts()).toEqual([0]));
    });

    it('keeps a queued gesture whose target the in-flight dispatch leaves in another state', async () => {
      const view = mountHeld(fourRanges);
      await waitFor(() => expect(screen.getByText('$0 - $100')).toBeDefined());

      clickRange('$0 - $100');
      clickRange('$100 - $200');
      // `toggleSingleSelect` flips: selected in the view but idle after the in-flight dispatch.
      clickRange('$100 - $200');

      await view.release();
      await view.release();
      await view.release();

      await waitFor(() => expect(view.starts()).toEqual([0, 100, 100]));
    });

    it('sends one request for a range clicked three times over', async () => {
      const view = mountHeld(fourRanges);
      await waitFor(() => expect(screen.getByText('$0 - $100')).toBeDefined());

      // The third flip matches the in-flight first, so the second and third cancel out.
      clickRange('$0 - $100');
      clickRange('$0 - $100');
      clickRange('$0 - $100');

      await waitFor(() =>
        expect(screen.getByText('$0 - $100').closest('button')!.getAttribute('aria-pressed')).toBe(
          'true'
        )
      );
      await view.release();

      await waitFor(() => expect(view.starts()).toEqual([0]));
    });

    it('lets a later range supersede a queued custom-range apply, like any slot gesture', async () => {
      // The apply is an absolute write of the slot, like `toggleSingleSelect`.
      const view = mountHeld(fourRanges);
      await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());

      clickRange('$0 - $100');
      fireEvent.change(screen.getByLabelText('Min'), {target: {value: '150'}});
      fireEvent.change(screen.getByLabelText('Max'), {target: {value: '250'}});
      fireEvent.click(screen.getByText('Apply'));
      clickRange('$300 - $400');

      await view.release();

      await waitFor(() => expect(view.starts()).toEqual([0, 300]));
    });
  });

  it('dispatches applyCustomRange with the entered numeric start/end on submit', async () => {
    const {lastAction} = mountFacet(stateWithRanges);

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'applyCustomRange', context: {start: 50, end: 150}})
    );
  });

  it('does not dispatch applyCustomRange when either custom-range input is empty', async () => {
    const {actions} = mountFacet(stateWithRanges);

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(actions.some((a) => a.name === 'applyCustomRange')).toBe(false);
  });

  it('does not dispatch applyCustomRange when an input is not a number', async () => {
    const {actions} = mountFacet(stateWithRanges);

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: 'abc'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(actions.some((a) => a.name === 'applyCustomRange')).toBe(false);
  });

  it('does not optimistically place the entered range, leaving its slot to the backend', async () => {
    // The backend sorts the custom range into `values`, which the client cannot replicate.
    const {lastAction} = mountFacet(
      {
        ...stateWithRanges,
        values: [
          {start: 0, end: 100, numberOfResults: 5, state: 'idle'},
          {start: 100, end: 200, numberOfResults: 4, state: 'idle'},
        ],
      },
      () => new Promise<void>(() => {})
    );

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '150'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '250'}});
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'applyCustomRange',
        context: {start: 150, end: 250},
      })
    );
    const labels = Array.from(screen.getByRole('list').querySelectorAll('li button')).map(
      (button) => button.querySelector('span')!.textContent
    );
    expect(labels).toEqual(['$0 - $100', '$100 - $200']);
    expect(
      Array.from(screen.getByRole('list').querySelectorAll('li button')).every(
        (button) => button.getAttribute('aria-pressed') === 'false'
      )
    ).toBe(true);
  });

  it('dims the custom-range inputs while the apply is in flight', async () => {
    const {container} = mountFacet(stateWithRanges, () => new Promise<void>(() => {}));

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    expect(container.querySelector('fieldset')!.hasAttribute('disabled')).toBe(false);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() =>
      expect(container.querySelector('fieldset')!.hasAttribute('disabled')).toBe(true)
    );
  });

  it('does not dim the custom-range inputs when toggling a listed range', async () => {
    // Held open, so a slot-wide pending signal would wrongly dim here.
    const {container, lastAction} = mountFacet(stateWithRanges, () => new Promise<void>(() => {}));

    await waitFor(() => expect(screen.getByText('$0 - $100')).toBeDefined());
    fireEvent.click(screen.getByText('$0 - $100'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'toggleSingleSelect',
        context: {start: 0, end: 100},
      })
    );
    expect(container.querySelector('fieldset')!.hasAttribute('disabled')).toBe(false);
  });

  it('clears the min/max inputs when clearing the facet', async () => {
    const {lastAction} = mountFacet({
      ...stateWithRanges,
      hasActiveValues: true,
      values: [
        {start: 0, end: 100, numberOfResults: 5, state: 'selected'},
        {start: 100, end: 200, numberOfResults: 2, state: 'idle'},
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('Clear'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'clearAllActiveValues', context: {}})
    );
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('clears the min/max inputs when selecting a different listed value', async () => {
    const {lastAction} = mountFacet({...stateWithRanges, hasActiveValues: true});

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('$0 - $100'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'toggleSingleSelect',
        context: {start: 0, end: 100},
      })
    );
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('applies the domain bounds as min/max attributes on the range inputs', async () => {
    mountFacet({...stateWithRanges, domain: {min: 20, max: 300}});

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    expect((screen.getByLabelText('Min') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Min') as HTMLInputElement).max).toBe('300');
    expect((screen.getByLabelText('Max') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Max') as HTMLInputElement).max).toBe('300');
  });

  it('normalizes a reversed custom range (min > max) before applying', async () => {
    const {lastAction} = mountFacet({...stateWithRanges, domain: {min: 0, max: 500}});

    await waitFor(() => expect(screen.getByLabelText('Min')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '150'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'applyCustomRange', context: {start: 50, end: 150}})
    );
  });

  it('disables the ranges, clear and custom range controls in a read-only surface', async () => {
    const {container, actions} = mountFacet(
      {
        ...stateWithRanges,
        hasActiveValues: true,
        values: [
          {start: 0, end: 100, numberOfResults: 5, state: 'selected'},
          {start: 100, end: 200, numberOfResults: 2, state: 'idle'},
        ],
      },
      undefined,
      true
    );

    await waitFor(() => expect(screen.getByText('Clear')).toBeDefined());
    expectEveryControlDisabled(container);
    clickEveryButton(container);
    fireEvent.submit(container.querySelector('form')!);
    expect(actions).toEqual([]);
  });
});

describe('CategoryFacet', () => {
  const stateWithChildren: CategoryFacetProps = {
    field: 'ec_category',
    displayName: 'Category',
    canShowMoreValues: false,
    canShowLessValues: false,
    values: {
      ancestry: [{path: ['Sporting Goods'], value: 'Sporting Goods', numberOfResults: 8}],
      selected: {path: ['Sporting Goods'], value: 'Sporting Goods', numberOfResults: 8},
      children: [
        {path: ['Sporting Goods', 'Water Sports'], value: 'Water Sports', numberOfResults: 6},
      ],
    },
    facetSearch: {query: '', canShowMoreResults: false, results: []},
  };

  function mountFacet(
    state: CategoryFacetProps,
    dispatchGate?: () => Promise<void> | void,
    readOnly?: boolean
  ) {
    return mountSurface({
      component: {
        component: 'CategoryFacet',
        ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
      },
      dispatchGate,
      readOnly,
      dataModel: (Object.keys(state) as Array<keyof CategoryFacetProps>).map((key) => ({
        path: `/state/root/${key}`,
        value: state[key],
      })),
    });
  }

  it('dispatches selectPath with the child path when a child is clicked', async () => {
    const {lastAction} = mountFacet(stateWithChildren);

    await waitFor(() => expect(screen.getByText('Water Sports')).toBeDefined());
    fireEvent.click(screen.getByText('Water Sports'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Water Sports']},
      })
    );
  });

  it('optimistically promotes the clicked child to the selected node before the backend reconciles', async () => {
    // The intent only stands while its dispatch is outstanding.
    let answer!: () => void;
    const pending = new Promise<void>((resolve) => (answer = resolve));
    mountFacet(stateWithChildren, () => pending);

    await waitFor(() => expect(screen.getByText('Water Sports')).toBeDefined());
    fireEvent.click(screen.getByText('Water Sports'));
    await waitFor(() =>
      expect(screen.getByTestId('facet-category-selected-ec_category').textContent).toContain(
        'Water Sports'
      )
    );
    answer();
  });

  it('dispatches clearSelectedPath when the "All Categories" back link is clicked', async () => {
    const {lastAction} = mountFacet(stateWithChildren);

    await waitFor(() => expect(screen.getByText('All Categories')).toBeDefined());
    fireEvent.click(screen.getByText('All Categories'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'clearSelectedPath', context: {}})
    );
  });

  it('renders ancestry parents as back links, the selected node highlighted, and children below', async () => {
    const {lastAction} = mountFacet({
      field: 'ec_category',
      displayName: 'Category',
      canShowMoreValues: false,
      canShowLessValues: false,
      values: {
        ancestry: [
          {path: ['Sporting Goods'], value: 'Sporting Goods', numberOfResults: 40},
          {path: ['Sporting Goods', 'Accessories'], value: 'Accessories', numberOfResults: 20},
          {
            path: ['Sporting Goods', 'Accessories', 'Surf Accessories'],
            value: 'Surf Accessories',
            numberOfResults: 12,
          },
        ],
        selected: {
          path: ['Sporting Goods', 'Accessories', 'Surf Accessories'],
          value: 'Surf Accessories',
          numberOfResults: 12,
        },
        children: [
          {
            path: ['Sporting Goods', 'Accessories', 'Surf Accessories', 'Surf Wax'],
            value: 'Surf Wax',
            numberOfResults: 3,
          },
        ],
      },
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    });

    await waitFor(() => expect(screen.getByText('All Categories')).toBeDefined());
    fireEvent.click(screen.getByText('All Categories'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'clearSelectedPath', context: {}})
    );

    fireEvent.click(screen.getByText('Accessories'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Accessories']},
      })
    );

    const selectedRow = screen.getByTestId('facet-category-selected-ec_category');
    expect(selectedRow.textContent).toContain('Surf Accessories');
    expect(selectedRow.textContent).toContain('(12)');

    fireEvent.click(screen.getByText('Surf Wax'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Accessories', 'Surf Accessories', 'Surf Wax']},
      })
    );
  });

  it('renders a "More matches for" control that dispatches showMoreSearchResults', async () => {
    const {lastAction} = mountFacet({
      ...stateWithChildren,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: true,
        results: [
          {
            path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 4,
          },
        ],
      },
    });

    await waitFor(() =>
      expect(screen.getByTestId('facet-search-show-more-ec_category')).toBeDefined()
    );
    const showMore = screen.getByTestId('facet-search-show-more-ec_category');
    expect(showMore.textContent).toBe('More matches for wet');
    fireEvent.click(showMore);
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'showMoreSearchResults', context: {}})
    );
  });

  it('hides the "More matches for" control when canShowMoreResults is false', async () => {
    mountFacet({
      ...stateWithChildren,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: false,
        results: [
          {
            path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 4,
          },
        ],
      },
    });

    await waitFor(() =>
      expect(
        screen.getByTestId('facet-search-result-Sporting Goods/Water Sports/Wetsuits')
      ).toBeDefined()
    );
    expect(screen.queryByTestId('facet-search-show-more-ec_category')).toBeNull();
  });

  it('renders search results and dispatches selectPath with the result path on click', async () => {
    const {lastAction} = mountFacet({
      ...stateWithChildren,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: false,
        results: [
          {
            path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 4,
          },
        ],
      },
    });

    await waitFor(() =>
      expect(
        screen.getByTestId('facet-search-result-Sporting Goods/Water Sports/Wetsuits')
      ).toBeDefined()
    );
    fireEvent.click(screen.getByTestId('facet-search-result-Sporting Goods/Water Sports/Wetsuits'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Water Sports', 'Wetsuits']},
      })
    );
  });

  it('shows the parent path of search results that share a leaf value and selects each one by its own path', async () => {
    const {lastAction} = mountFacet({
      ...stateWithChildren,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: false,
        results: [
          {
            path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 4,
          },
          {path: ['Clothing', 'Wetsuits'], value: 'Wetsuits', numberOfResults: 2},
        ],
      },
    });

    const waterSportsTestId = 'facet-search-result-Sporting Goods/Water Sports/Wetsuits';
    const clothingTestId = 'facet-search-result-Clothing/Wetsuits';
    await waitFor(() => expect(screen.getByTestId(waterSportsTestId)).toBeDefined());

    expect(
      screen.getByTestId('facet-search-result-path-Sporting Goods/Water Sports/Wetsuits')
        .textContent
    ).toBe('inSporting Goods/Water Sports');
    expect(screen.getByTestId('facet-search-result-path-Clothing/Wetsuits').textContent).toBe(
      'inClothing'
    );
    expect(screen.getByTestId(waterSportsTestId).getAttribute('aria-label')).toBe(
      'Wetsuits (4) under Sporting Goods, Water Sports'
    );
    expect(screen.getByTestId(clothingTestId).getAttribute('aria-label')).toBe(
      'Wetsuits (2) under Clothing'
    );

    fireEvent.click(screen.getByTestId(waterSportsTestId));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Water Sports', 'Wetsuits']},
      })
    );

    fireEvent.click(screen.getByTestId(clothingTestId));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectPath',
        context: {path: ['Clothing', 'Wetsuits']},
      })
    );
  });

  it('shows "All Categories" for root search results and ellipses long parent paths', async () => {
    mountFacet({
      ...stateWithChildren,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: false,
        results: [
          {path: ['Wetsuits'], value: 'Wetsuits', numberOfResults: 1},
          {
            path: ['Sporting Goods', 'Water Sports', 'Surfing', 'Gear', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 3,
          },
        ],
      },
    });

    await waitFor(() =>
      expect(screen.getByTestId('facet-search-result-path-Wetsuits')).toBeDefined()
    );
    expect(screen.getByTestId('facet-search-result-path-Wetsuits').textContent).toBe(
      'inAll Categories'
    );
    expect(
      screen.getByTestId(
        'facet-search-result-path-Sporting Goods/Water Sports/Surfing/Gear/Wetsuits'
      ).textContent
    ).toBe('inSporting Goods/.../Surfing/Gear');
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', async () => {
    const {lastAction} = mountFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: false,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-more-ec_category')).toBeDefined());
    expect(screen.queryByTestId('facet-show-less-ec_category')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-ec_category'));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'showMoreValues', context: {}}));
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', async () => {
    const {lastAction} = mountFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-less-ec_category')).toBeDefined());
    fireEvent.click(screen.getByTestId('facet-show-less-ec_category'));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'showLessValues', context: {}}));
  });

  it('renders "- Show less" above "+ Show more" when both are available', async () => {
    const {container} = mountFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    await waitFor(() => expect(screen.getByTestId('facet-show-less-ec_category')).toBeDefined());
    const buttons = Array.from(
      container.querySelectorAll(
        '[data-testid="facet-show-less-ec_category"], [data-testid="facet-show-more-ec_category"]'
      )
    );
    expect(buttons.map((b) => b.getAttribute('data-testid'))).toEqual([
      'facet-show-less-ec_category',
      'facet-show-more-ec_category',
    ]);
  });

  it('does not show value show-more/less controls while a facet search is active', async () => {
    mountFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: true,
      facetSearch: {
        query: 'wet',
        canShowMoreResults: false,
        results: [
          {
            path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
            value: 'Wetsuits',
            numberOfResults: 4,
          },
        ],
      },
    });

    await waitFor(() =>
      expect(
        screen.getByTestId('facet-search-result-Sporting Goods/Water Sports/Wetsuits')
      ).toBeDefined()
    );
    expect(screen.queryByTestId('facet-show-more-ec_category')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-ec_category')).toBeNull();
  });

  describe('in a read-only surface', () => {
    it('disables the tree, search and show-more controls and dispatches nothing', async () => {
      const {container, actions} = mountFacet(
        {
          ...stateWithChildren,
          values: {
            ...stateWithChildren.values,
            ancestry: [
              {path: ['Sporting Goods'], value: 'Sporting Goods', numberOfResults: 8},
              {
                path: ['Sporting Goods', 'Water Sports'],
                value: 'Water Sports',
                numberOfResults: 6,
              },
            ],
            selected: {
              path: ['Sporting Goods', 'Water Sports'],
              value: 'Water Sports',
              numberOfResults: 6,
            },
            children: [
              {
                path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
                value: 'Wetsuits',
                numberOfResults: 4,
              },
            ],
          },
          canShowMoreValues: true,
          canShowLessValues: true,
        },
        undefined,
        true
      );

      await waitFor(() => expect(screen.getByText('Wetsuits')).toBeDefined());
      expectEveryControlDisabled(container);
      clickEveryButton(container);
      expect(actions).toEqual([]);
    });

    it('disables the search results and "More matches for" control', async () => {
      const {container, actions} = mountFacet(
        {
          ...stateWithChildren,
          facetSearch: {
            query: 'wet',
            canShowMoreResults: true,
            results: [
              {
                path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
                value: 'Wetsuits',
                numberOfResults: 4,
              },
            ],
          },
        },
        undefined,
        true
      );

      await waitFor(() =>
        expect(screen.getByTestId('facet-search-show-more-ec_category')).toBeDefined()
      );
      expectEveryControlDisabled(container);
      clickEveryButton(container);
      expect(actions).toEqual([]);
    });
  });
});

describe('FacetManager', () => {
  // FacetManager mounts its ordered `children` id list via `buildChild`. Each child id names a
  // real catalog component declared as a sibling node; the test asserts the mounted DOM
  // order (the observable effect of the ordered `buildChild` calls). Children are RegularFacet
  // nodes keyed by a distinguishing `data-testid` (the facet's `field`).
  function facetChild(id: string, field: string): Record<string, unknown> {
    return {
      id,
      component: 'RegularFacet',
      field,
      displayName: field,
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
      values: [],
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    };
  }

  const CHILD_FIELDS: Record<string, string> = {
    'facet-brand-1': 'brand',
    'facet-price-1': 'price',
    'facet-category-1': 'category',
  };

  function mountManager(childIds: string[]) {
    return mountSurface({
      component: {component: 'FacetManager', children: childIds},
      children: childIds
        .filter((id) => CHILD_FIELDS[id] !== undefined)
        .map((id) => facetChild(id, CHILD_FIELDS[id])),
    });
  }

  function renderedFields(container: HTMLElement): string[] {
    // Match only the RegularFacet SECTION roots (`facet-<field>`), not nested testids such as
    // `facet-search-input-<field>`. The manager container itself is `facet-manager`.
    const fieldTestIds = /^facet-(brand|price|category)$/;
    return Array.from(container.querySelectorAll('[data-testid]'))
      .map((node) => node.getAttribute('data-testid'))
      .filter((id): id is string => id !== null && fieldTestIds.test(id))
      .map((id) => id.replace('facet-', ''));
  }

  it('mounts each facet child id in declared order via buildChild', async () => {
    const childIds = ['facet-category-1', 'facet-brand-1', 'facet-price-1'];
    const {container} = mountManager(childIds);

    await waitFor(() => expect(screen.getByTestId('facet-manager')).toBeDefined());
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="facet-category"]').length).toBe(1)
    );
    expect(renderedFields(container)).toEqual(['category', 'brand', 'price']);
  });

  it.each([
    ['facet-brand-1', 'facet-price-1', 'facet-category-1'],
    ['facet-price-1', 'facet-category-1', 'facet-brand-1'],
    ['facet-category-1', 'facet-brand-1', 'facet-price-1'],
    ['facet-price-1', 'facet-brand-1', 'facet-category-1'],
  ])('mounts DOM order equal to the children list for permutation %#', async (...childIds) => {
    const {container} = mountManager(childIds);

    await waitFor(() => expect(screen.getByTestId('facet-manager')).toBeDefined());
    const expected = childIds.map((id) => CHILD_FIELDS[id]);
    await waitFor(() => expect(renderedFields(container)).toEqual(expected));
  });

  it('skips a declared child id with no corresponding component, keeping the rest in order', async () => {
    const childIds = ['facet-brand-1', 'facet-unknown-1', 'facet-price-1'];
    const {container} = mountManager(childIds);

    await waitFor(() => expect(screen.getByTestId('facet-manager')).toBeDefined());
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="facet-price"]').length).toBe(1)
    );
    expect(renderedFields(container)).toEqual(['brand', 'price']);
  });

  it('mounts no facets and renders without error when the children list is empty', async () => {
    const {container} = mountManager([]);

    await waitFor(() => expect(screen.getByTestId('facet-manager')).toBeDefined());
    expect(renderedFields(container)).toEqual([]);
  });

  it('mounts no facets and renders without error when composition is unavailable', async () => {
    // No `children` prop at all → props.children resolves undefined → nothing mounted.
    mountSurface({component: {component: 'FacetManager'}});

    await waitFor(() => expect(screen.getByTestId('facet-manager')).toBeDefined());
  });
});
