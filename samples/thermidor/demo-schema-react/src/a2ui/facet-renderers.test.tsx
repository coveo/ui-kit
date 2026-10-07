import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import type {
  RegularFacetProps,
  NumericFacetProps,
  CategoryFacetProps,
} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

/**
 * The facet components are `createReactComponent` implementations driven by the generic binder,
 * mounted end-to-end through the real thermidor catalog: resolved state is written to the surface
 * data model via `{path}` bindings, and every gesture dispatches an action that surfaces
 * (unwrapped) on `lastAction()` as `{name, context}`. FacetManager mounts its ordered children by
 * id via `buildChild`; the tests assert the observable mounted DOM order.
 */

afterEach(() => cleanup());

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

  function mountFacet(state: RegularFacetProps) {
    return mountSurface({
      component: {component: 'RegularFacet', ...BINDINGS},
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

  function mountFacet(state: NumericFacetProps) {
    return mountSurface({
      component: {
        component: 'NumericFacet',
        ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
      },
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

  it('renders an applied custom range as the last, selected value item', async () => {
    mountFacet({
      ...stateWithRanges,
      hasActiveValues: true,
      customRange: {start: 25, end: 175, numberOfResults: 6},
    });

    await waitFor(() => expect(screen.getByTestId('facet-custom-range-ec_price')).toBeDefined());
    const items = screen.getAllByRole('button', {pressed: true});
    const customItem = screen.getByTestId('facet-custom-range-ec_price');
    expect(customItem.textContent).toContain('$25 - $175');
    expect(customItem.getAttribute('aria-pressed')).toBe('true');

    const values = screen.getByRole('list').querySelectorAll('li button');
    expect(values[values.length - 1]).toBe(customItem);
    expect(items).toContain(customItem);
  });

  it('clears the min/max inputs when clearing the facet', async () => {
    const {lastAction} = mountFacet({...stateWithRanges, hasActiveValues: true});

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

  function mountFacet(state: CategoryFacetProps) {
    return mountSurface({
      component: {
        component: 'CategoryFacet',
        ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
      },
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

    await waitFor(() => expect(screen.getByTestId('facet-search-result-Wetsuits')).toBeDefined());
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
