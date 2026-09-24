import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import type {
  RegularFacetProps,
  NumericFacetProps,
  CategoryFacetProps,
  FacetManagerProps,
} from '@coveo/thermidor-schema/zod3';
import {RegularFacetRenderer} from './RegularFacet/RegularFacet.js';
import {NumericFacetRenderer} from './NumericFacet/NumericFacet.js';
import {CategoryFacetRenderer} from './CategoryFacet/CategoryFacet.js';
import {FacetManagerRenderer} from './FacetManager/FacetManager.js';

afterEach(() => cleanup());

describe('RegularFacetRenderer', () => {
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

  function renderFacet(props: RegularFacetProps, dispatch = vi.fn()) {
    return {dispatch, ...render(<RegularFacetRenderer props={props} dispatch={dispatch} />)};
  }

  it('dispatches toggleSelect when a value control is clicked', () => {
    const {dispatch} = renderFacet(stateWithValues);

    fireEvent.click(screen.getByTestId('facet-value-Billabong'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'toggleSelect', context: {value: 'Billabong'}},
    });
  });

  it('renders values as checkboxes reflecting selection state', () => {
    renderFacet(stateWithValues);

    const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
    const quiksilver = screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement;
    expect(billabong.type).toBe('checkbox');
    expect(billabong.checked).toBe(false);
    expect(quiksilver.checked).toBe(true);
  });

  it('dispatches clearAllActiveValues when the clear control is activated', () => {
    const {dispatch} = renderFacet(stateWithValues);

    fireEvent.click(screen.getByLabelText('Clear Brand selections'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'clearAllActiveValues', context: {}},
    });
  });

  it('renders a pinned selected value (from search) as a checked checkbox at the top', () => {
    renderFacet({
      ...stateWithValues,
      values: [
        {value: 'Cressi', numberOfResults: 1, state: 'selected'},
        {value: 'Billabong', numberOfResults: 4, state: 'idle'},
        {value: 'Quiksilver', numberOfResults: 2, state: 'idle'},
      ],
    });

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].getAttribute('data-testid')).toBe('facet-value-Cressi');
    expect(checkboxes[0].checked).toBe(true);
  });

  it('dispatches search on each change and keeps the input responsive', () => {
    const {dispatch} = renderFacet(stateWithValues);

    const input = screen.getByTestId('facet-search-input-ec_brand') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'ri'}});
    fireEvent.change(input, {target: {value: 'rip'}});

    // The input reflects the typed value immediately (kept in local state).
    expect(input.value).toBe('rip');

    // A search action is dispatched for each change through the action seam.
    expect(dispatch).toHaveBeenNthCalledWith(1, {event: {name: 'search', context: {query: 'ri'}}});
    expect(dispatch).toHaveBeenNthCalledWith(2, {event: {name: 'search', context: {query: 'rip'}}});
  });

  it('renders search results in place of the value list and dispatches toggleSelect on result click', () => {
    const {dispatch} = renderFacet({
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

    expect(screen.queryByTestId('facet-value-Billabong')).toBeNull();
    expect(screen.getByTestId('facet-search-result-Rip Curl')).toBeDefined();

    fireEvent.click(screen.getByTestId('facet-search-result-Rip Curl'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'toggleSelect', context: {value: 'Rip Curl'}},
    });
  });

  it('dispatches showMoreSearchResults when the show-more control is activated', () => {
    const {dispatch} = renderFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'i',
        canShowMoreResults: true,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    });

    fireEvent.click(screen.getByText('Show more'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'showMoreSearchResults', context: {}},
    });
  });

  it('dispatches clearSearch when the clear-search affordance is activated', () => {
    const {dispatch} = renderFacet({
      ...stateWithValues,
      facetSearch: {
        query: 'rip',
        canShowMoreResults: false,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    });

    fireEvent.click(screen.getByLabelText('Clear Brand search'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'clearSearch', context: {}}});
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', () => {
    const {dispatch} = renderFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: false,
    });

    expect(screen.queryByTestId('facet-show-less-ec_brand')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-ec_brand'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'showMoreValues', context: {}}});
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', () => {
    const {dispatch} = renderFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    fireEvent.click(screen.getByTestId('facet-show-less-ec_brand'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'showLessValues', context: {}}});
  });

  it('renders "- Show less" above "+ Show more" when both are available', () => {
    const {container} = renderFacet({
      ...stateWithValues,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

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

  it('shows neither show-more nor show-less when both flags are false', () => {
    renderFacet({...stateWithValues, canShowMoreValues: false, canShowLessValues: false});

    expect(screen.queryByTestId('facet-show-more-ec_brand')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-ec_brand')).toBeNull();
  });
});

describe('NumericFacetRenderer', () => {
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

  function renderFacet(props: NumericFacetProps, dispatch = vi.fn()) {
    return {dispatch, ...render(<NumericFacetRenderer props={props} dispatch={dispatch} />)};
  }

  it('dispatches toggleSingleSelect with the range start/end when a listed range is clicked', () => {
    const {dispatch} = renderFacet(stateWithRanges);

    fireEvent.click(screen.getByText('$100 - $200'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'toggleSingleSelect', context: {start: 100, end: 200}},
    });
  });

  it('dispatches applyCustomRange with the entered numeric start/end on submit', () => {
    const {dispatch} = renderFacet(stateWithRanges);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'applyCustomRange', context: {start: 50, end: 150}},
    });
  });

  it('does not dispatch applyCustomRange when either custom-range input is empty', () => {
    const {dispatch} = renderFacet(stateWithRanges);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({event: expect.objectContaining({name: 'applyCustomRange'})})
    );
  });

  it('does not dispatch applyCustomRange when an input is not a number', () => {
    const {dispatch} = renderFacet(stateWithRanges);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: 'abc'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({event: expect.objectContaining({name: 'applyCustomRange'})})
    );
  });

  it('renders an applied custom range as the last, selected value item', () => {
    renderFacet({
      ...stateWithRanges,
      hasActiveValues: true,
      customRange: {start: 25, end: 175, numberOfResults: 6},
    });

    const items = screen.getAllByRole('button', {pressed: true});
    const customItem = screen.getByTestId('facet-custom-range-ec_price');
    expect(customItem.textContent).toContain('$25 - $175');
    expect(customItem.getAttribute('aria-pressed')).toBe('true');

    const values = screen.getByRole('list').querySelectorAll('li button');
    expect(values[values.length - 1]).toBe(customItem);
    expect(items).toContain(customItem);
  });

  it('clears the min/max inputs when clearing the facet', () => {
    const {dispatch} = renderFacet({...stateWithRanges, hasActiveValues: true});

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('Clear'));

    expect(dispatch).toHaveBeenCalledWith({event: {name: 'clearAllActiveValues', context: {}}});
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('clears the min/max inputs when selecting a different listed value', () => {
    const {dispatch} = renderFacet({...stateWithRanges, hasActiveValues: true});

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('$0 - $100'));

    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'toggleSingleSelect', context: {start: 0, end: 100}},
    });
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('applies the domain bounds as min/max attributes on the range inputs', () => {
    renderFacet({...stateWithRanges, domain: {min: 20, max: 300}});

    expect((screen.getByLabelText('Min') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Min') as HTMLInputElement).max).toBe('300');
    expect((screen.getByLabelText('Max') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Max') as HTMLInputElement).max).toBe('300');
  });

  it('normalizes a reversed custom range (min > max) before applying', () => {
    const {dispatch} = renderFacet({...stateWithRanges, domain: {min: 0, max: 500}});

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '150'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'applyCustomRange', context: {start: 50, end: 150}},
    });
  });
});

describe('CategoryFacetRenderer', () => {
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

  function renderFacet(props: CategoryFacetProps, dispatch = vi.fn()) {
    return {dispatch, ...render(<CategoryFacetRenderer props={props} dispatch={dispatch} />)};
  }

  it('dispatches selectPath with the child path when a child is clicked', () => {
    const {dispatch} = renderFacet(stateWithChildren);

    fireEvent.click(screen.getByText('Water Sports'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'selectPath', context: {path: ['Sporting Goods', 'Water Sports']}},
    });
  });

  it('dispatches clearSelectedPath when the "All Categories" back link is clicked', () => {
    const {dispatch} = renderFacet(stateWithChildren);

    fireEvent.click(screen.getByText('All Categories'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'clearSelectedPath', context: {}}});
  });

  it('renders ancestry parents as back links, the selected node highlighted, and children below', () => {
    const {dispatch} = renderFacet({
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

    fireEvent.click(screen.getByText('All Categories'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'clearSelectedPath', context: {}}});

    fireEvent.click(screen.getByText('Accessories'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'selectPath', context: {path: ['Sporting Goods', 'Accessories']}},
    });

    const selectedRow = screen.getByTestId('facet-category-selected-ec_category');
    expect(selectedRow.textContent).toContain('Surf Accessories');
    expect(selectedRow.textContent).toContain('(12)');

    fireEvent.click(screen.getByText('Surf Wax'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {
        name: 'selectPath',
        context: {path: ['Sporting Goods', 'Accessories', 'Surf Accessories', 'Surf Wax']},
      },
    });
  });

  it('renders search results and dispatches selectPath with the result path on click', () => {
    const {dispatch} = renderFacet({
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

    expect(screen.getByTestId('facet-search-result-Wetsuits')).toBeDefined();

    fireEvent.click(screen.getByTestId('facet-search-result-Wetsuits'));
    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'selectPath', context: {path: ['Sporting Goods', 'Water Sports', 'Wetsuits']}},
    });
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', () => {
    const {dispatch} = renderFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: false,
    });

    expect(screen.queryByTestId('facet-show-less-ec_category')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-ec_category'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'showMoreValues', context: {}}});
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', () => {
    const {dispatch} = renderFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

    fireEvent.click(screen.getByTestId('facet-show-less-ec_category'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'showLessValues', context: {}}});
  });

  it('renders "- Show less" above "+ Show more" when both are available', () => {
    const {container} = renderFacet({
      ...stateWithChildren,
      canShowMoreValues: true,
      canShowLessValues: true,
    });

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

  it('does not show value show-more/less controls while a facet search is active', () => {
    renderFacet({
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

    expect(screen.queryByTestId('facet-show-more-ec_category')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-ec_category')).toBeNull();
  });
});

describe('FacetManagerRenderer', () => {
  const presentIds = new Set(['facet-brand-1', 'facet-price-1', 'facet-category-1']);

  function makeMountFn() {
    return vi.fn((id: string) => (presentIds.has(id) ? <span data-testid={id}>{id}</span> : null));
  }

  // A FacetManager renderer receives its ordered child ids on the resolved `children` prop.
  function propsWithChildren(children?: string[]): FacetManagerProps {
    return (children === undefined ? {} : {children}) as FacetManagerProps;
  }

  it('mounts each facet child id in declared order via the children mount function', () => {
    const childIds = ['facet-category-1', 'facet-brand-1', 'facet-price-1'];
    const mount = makeMountFn();

    render(<FacetManagerRenderer props={propsWithChildren(childIds)} children={mount} />);

    expect(mount.mock.calls.map((call) => call[0])).toEqual(childIds);
    const renderedOrder = screen
      .getAllByTestId(/^facet-(brand|price|category)-1$/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(childIds);
  });

  it.each([
    ['facet-brand-1', 'facet-price-1', 'facet-category-1'],
    ['facet-price-1', 'facet-category-1', 'facet-brand-1'],
    ['facet-category-1', 'facet-brand-1', 'facet-price-1'],
    ['facet-price-1', 'facet-brand-1', 'facet-category-1'],
  ])('mounts DOM order equal to the children list for permutation %#', (...childIds) => {
    const mount = makeMountFn();

    render(<FacetManagerRenderer props={propsWithChildren(childIds)} children={mount} />);

    expect(mount.mock.calls.map((call) => call[0])).toEqual(childIds);
    const renderedOrder = screen
      .getAllByTestId(/^facet-(brand|price|category)-1$/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual([...childIds]);
  });

  it('skips a declared child id with no corresponding component, keeping the rest in order', () => {
    const childIds = ['facet-brand-1', 'facet-unknown-1', 'facet-price-1'];
    const mount = makeMountFn();

    render(<FacetManagerRenderer props={propsWithChildren(childIds)} children={mount} />);

    expect(mount.mock.calls.map((call) => call[0])).toEqual(childIds);
    const renderedOrder = screen
      .getAllByTestId(/^facet-(brand|price|category)-1$/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(['facet-brand-1', 'facet-price-1']);
    expect(screen.queryByTestId('facet-unknown-1')).toBeNull();
  });

  it('mounts no facets and renders without error when the children list is empty', () => {
    const mount = makeMountFn();

    render(<FacetManagerRenderer props={propsWithChildren([])} children={mount} />);

    expect(mount).not.toHaveBeenCalled();
    expect(screen.getByTestId('facet-manager')).toBeDefined();
  });

  it('mounts no facets and renders without error when composition is unavailable', () => {
    const mount = makeMountFn();

    render(<FacetManagerRenderer props={propsWithChildren(undefined)} children={mount} />);

    expect(mount).not.toHaveBeenCalled();
    expect(screen.getByTestId('facet-manager')).toBeDefined();
  });
});
