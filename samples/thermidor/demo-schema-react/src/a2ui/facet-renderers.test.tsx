import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {RegularFacetRenderer} from './RegularFacet/RegularFacet.js';
import {NumericFacetRenderer} from './NumericFacet/NumericFacet.js';
import {CategoryFacetRenderer} from './CategoryFacet/CategoryFacet.js';
import {FacetManagerRenderer, type FacetProps} from './FacetManager/FacetManager.js';

const mockDispatch = vi.fn().mockResolvedValue(undefined);
let mockControllerState: unknown = undefined;

vi.mock('./controllers.js', () => ({
  useRemoteController: () => ({
    state: mockControllerState,
    dispatch: mockDispatch,
    subscribe: () => () => undefined,
  }),
}));

vi.mock('./state-source-context.js', () => ({
  useStateSource: () => ({}),
}));

beforeEach(() => {
  mockControllerState = undefined;
  mockDispatch.mockClear();
});

describe('RegularFacetRenderer', () => {
  const props = {componentId: 'facet-brand-1', componentType: 'regular-facet' as const};

  const stateWithValues = {
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

  it('renders nothing when state is undefined', () => {
    mockControllerState = undefined;
    const {container} = render(<RegularFacetRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('dispatches toggleSelect when a value control is clicked', () => {
    mockControllerState = stateWithValues;
    render(<RegularFacetRenderer props={props} />);

    fireEvent.click(screen.getByTestId('facet-value-Billabong'));
    expect(mockDispatch).toHaveBeenCalledWith('toggleSelect', {value: 'Billabong'});
  });

  it('renders values as checkboxes reflecting selection state', () => {
    mockControllerState = stateWithValues;
    render(<RegularFacetRenderer props={props} />);

    const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
    const quiksilver = screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement;
    expect(billabong.type).toBe('checkbox');
    expect(billabong.checked).toBe(false);
    expect(quiksilver.checked).toBe(true);
  });

  it('dispatches clearAllActiveValues when the clear control is activated', () => {
    mockControllerState = stateWithValues;
    render(<RegularFacetRenderer props={props} />);

    fireEvent.click(screen.getByLabelText('Clear Brand selections'));
    expect(mockDispatch).toHaveBeenCalledWith('clearAllActiveValues', {});
  });

  it('renders a pinned selected value (from search) as a checked checkbox at the top', () => {
    mockControllerState = {
      ...stateWithValues,
      values: [
        {value: 'Cressi', numberOfResults: 1, state: 'selected'},
        {value: 'Billabong', numberOfResults: 4, state: 'idle'},
        {value: 'Quiksilver', numberOfResults: 2, state: 'idle'},
      ],
    };
    render(<RegularFacetRenderer props={props} />);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].getAttribute('data-testid')).toBe('facet-value-Cressi');
    expect(checkboxes[0].checked).toBe(true);
  });

  it('dispatches search on each change and keeps the input responsive', () => {
    mockControllerState = stateWithValues;
    render(<RegularFacetRenderer props={props} />);

    const input = screen.getByTestId('facet-search-input-facet-brand-1') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'ri'}});
    fireEvent.change(input, {target: {value: 'rip'}});

    // The input reflects the typed value immediately.
    expect(input.value).toBe('rip');

    // A request is dispatched for each change.
    expect(mockDispatch).toHaveBeenNthCalledWith(1, 'search', {query: 'ri'});
    expect(mockDispatch).toHaveBeenNthCalledWith(2, 'search', {query: 'rip'});
  });

  it('renders search results in place of the value list and dispatches toggleSelect on result click', () => {
    mockControllerState = {
      ...stateWithValues,
      facetSearch: {
        query: 'rip',
        canShowMoreResults: true,
        results: [
          {value: 'Rip Curl', numberOfResults: 3},
          {value: 'Cressi', numberOfResults: 1},
        ],
      },
    };
    render(<RegularFacetRenderer props={props} />);

    expect(screen.queryByTestId('facet-value-Billabong')).toBeNull();
    expect(screen.getByTestId('facet-search-result-Rip Curl')).toBeDefined();

    fireEvent.click(screen.getByTestId('facet-search-result-Rip Curl'));
    expect(mockDispatch).toHaveBeenCalledWith('toggleSelect', {value: 'Rip Curl'});
  });

  it('dispatches showMoreSearchResults when the show-more control is activated', () => {
    mockControllerState = {
      ...stateWithValues,
      facetSearch: {
        query: 'i',
        canShowMoreResults: true,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    };
    render(<RegularFacetRenderer props={props} />);

    fireEvent.click(screen.getByText('Show more'));
    expect(mockDispatch).toHaveBeenCalledWith('showMoreSearchResults', {});
  });

  it('dispatches clearSearch when the clear-search affordance is activated', () => {
    mockControllerState = {
      ...stateWithValues,
      facetSearch: {
        query: 'rip',
        canShowMoreResults: false,
        results: [{value: 'Rip Curl', numberOfResults: 3}],
      },
    };
    render(<RegularFacetRenderer props={props} />);

    fireEvent.click(screen.getByLabelText('Clear Brand search'));
    expect(mockDispatch).toHaveBeenCalledWith('clearSearch', {});
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', () => {
    mockControllerState = {...stateWithValues, canShowMoreValues: true, canShowLessValues: false};
    render(<RegularFacetRenderer props={props} />);

    expect(screen.queryByTestId('facet-show-less-facet-brand-1')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-facet-brand-1'));
    expect(mockDispatch).toHaveBeenCalledWith('showMoreValues', {});
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', () => {
    mockControllerState = {...stateWithValues, canShowMoreValues: true, canShowLessValues: true};
    render(<RegularFacetRenderer props={props} />);

    fireEvent.click(screen.getByTestId('facet-show-less-facet-brand-1'));
    expect(mockDispatch).toHaveBeenCalledWith('showLessValues', {});
  });

  it('renders "- Show less" above "+ Show more" when both are available', () => {
    mockControllerState = {...stateWithValues, canShowMoreValues: true, canShowLessValues: true};
    const {container} = render(<RegularFacetRenderer props={props} />);

    const buttons = Array.from(
      container.querySelectorAll(
        '[data-testid="facet-show-less-facet-brand-1"], [data-testid="facet-show-more-facet-brand-1"]'
      )
    );
    expect(buttons.map((b) => b.getAttribute('data-testid'))).toEqual([
      'facet-show-less-facet-brand-1',
      'facet-show-more-facet-brand-1',
    ]);
  });

  it('shows neither show-more nor show-less when both flags are false', () => {
    mockControllerState = {...stateWithValues, canShowMoreValues: false, canShowLessValues: false};
    render(<RegularFacetRenderer props={props} />);

    expect(screen.queryByTestId('facet-show-more-facet-brand-1')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-facet-brand-1')).toBeNull();
  });
});

describe('NumericFacetRenderer', () => {
  const props = {componentId: 'facet-price-1', componentType: 'numeric-facet' as const};

  const stateWithRanges = {
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

  it('renders nothing when state is undefined', () => {
    mockControllerState = undefined;
    const {container} = render(<NumericFacetRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('dispatches toggleSingleSelect with the range start/end when a listed range is clicked', () => {
    mockControllerState = stateWithRanges;
    render(<NumericFacetRenderer props={props} />);

    fireEvent.click(screen.getByText('$100 - $200'));
    expect(mockDispatch).toHaveBeenCalledWith('toggleSingleSelect', {start: 100, end: 200});
  });

  it('dispatches applyCustomRange with the entered numeric start/end on submit', () => {
    mockControllerState = stateWithRanges;
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(mockDispatch).toHaveBeenCalledWith('applyCustomRange', {start: 50, end: 150});
  });

  it('does not dispatch applyCustomRange when either custom-range input is empty', () => {
    mockControllerState = stateWithRanges;
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(mockDispatch).not.toHaveBeenCalledWith('applyCustomRange', expect.anything());
  });

  it('does not dispatch applyCustomRange when an input is not a number', () => {
    mockControllerState = stateWithRanges;
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: 'abc'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '150'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(mockDispatch).not.toHaveBeenCalledWith('applyCustomRange', expect.anything());
  });

  it('renders an applied custom range as the last, selected value item', () => {
    mockControllerState = {
      ...stateWithRanges,
      hasActiveValues: true,
      customRange: {start: 25, end: 175, numberOfResults: 6},
    };
    render(<NumericFacetRenderer props={props} />);

    const items = screen.getAllByRole('button', {pressed: true});
    const customItem = screen.getByTestId('facet-custom-range-facet-price-1');
    expect(customItem.textContent).toContain('$25 - $175');
    expect(customItem.getAttribute('aria-pressed')).toBe('true');

    const values = screen.getByRole('list').querySelectorAll('li button');
    expect(values[values.length - 1]).toBe(customItem);
    expect(items).toContain(customItem);
  });

  it('clears the min/max inputs when clearing the facet', () => {
    mockControllerState = {...stateWithRanges, hasActiveValues: true};
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('Clear'));

    expect(mockDispatch).toHaveBeenCalledWith('clearAllActiveValues', {});
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('clears the min/max inputs when selecting a different listed value', () => {
    mockControllerState = {...stateWithRanges, hasActiveValues: true};
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '25'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '175'}});
    fireEvent.click(screen.getByText('$0 - $100'));

    expect(mockDispatch).toHaveBeenCalledWith('toggleSingleSelect', {start: 0, end: 100});
    expect((screen.getByLabelText('Min') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Max') as HTMLInputElement).value).toBe('');
  });

  it('applies the domain bounds as min/max attributes on the range inputs', () => {
    mockControllerState = {...stateWithRanges, domain: {min: 20, max: 300}};
    render(<NumericFacetRenderer props={props} />);

    expect((screen.getByLabelText('Min') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Min') as HTMLInputElement).max).toBe('300');
    expect((screen.getByLabelText('Max') as HTMLInputElement).min).toBe('20');
    expect((screen.getByLabelText('Max') as HTMLInputElement).max).toBe('300');
  });

  it('normalizes a reversed custom range (min > max) before applying', () => {
    mockControllerState = {...stateWithRanges, domain: {min: 0, max: 500}};
    render(<NumericFacetRenderer props={props} />);

    fireEvent.change(screen.getByLabelText('Min'), {target: {value: '150'}});
    fireEvent.change(screen.getByLabelText('Max'), {target: {value: '50'}});
    fireEvent.click(screen.getByText('Apply'));

    expect(mockDispatch).toHaveBeenCalledWith('applyCustomRange', {start: 50, end: 150});
  });
});

describe('CategoryFacetRenderer', () => {
  const props = {componentId: 'facet-category-1', componentType: 'category-facet' as const};

  const stateWithChildren = {
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

  it('renders nothing when state is undefined', () => {
    mockControllerState = undefined;
    const {container} = render(<CategoryFacetRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('dispatches selectPath with the child path when a child is clicked', () => {
    mockControllerState = stateWithChildren;
    render(<CategoryFacetRenderer props={props} />);

    fireEvent.click(screen.getByText('Water Sports'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPath', {
      path: ['Sporting Goods', 'Water Sports'],
    });
  });

  it('dispatches clearSelectedPath when the "All Categories" back link is clicked', () => {
    mockControllerState = stateWithChildren;
    render(<CategoryFacetRenderer props={props} />);

    fireEvent.click(screen.getByText('All Categories'));
    expect(mockDispatch).toHaveBeenCalledWith('clearSelectedPath', {});
  });

  it('renders ancestry parents as back links, the selected node highlighted, and children below', () => {
    mockControllerState = {
      field: 'ec_category',
      displayName: 'Category',
      canShowMoreValues: false,
      canShowLessValues: false,
      values: {
        ancestry: [
          {path: ['Sporting Goods'], value: 'Sporting Goods', numberOfResults: 40},
          {
            path: ['Sporting Goods', 'Accessories'],
            value: 'Accessories',
            numberOfResults: 20,
          },
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
    };
    render(<CategoryFacetRenderer props={props} />);

    // "All Categories" plus the two parent nodes are back links; the selected node is not.
    fireEvent.click(screen.getByText('All Categories'));
    expect(mockDispatch).toHaveBeenCalledWith('clearSelectedPath', {});

    fireEvent.click(screen.getByText('Accessories'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPath', {
      path: ['Sporting Goods', 'Accessories'],
    });

    const selectedRow = screen.getByTestId('facet-category-selected-facet-category-1');
    expect(selectedRow.textContent).toContain('Surf Accessories');
    expect(selectedRow.textContent).toContain('(12)');

    fireEvent.click(screen.getByText('Surf Wax'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPath', {
      path: ['Sporting Goods', 'Accessories', 'Surf Accessories', 'Surf Wax'],
    });
  });

  it('renders search results and dispatches selectPath with the result path on click', () => {
    mockControllerState = {
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
    };
    render(<CategoryFacetRenderer props={props} />);

    expect(screen.getByTestId('facet-search-result-Wetsuits')).toBeDefined();

    fireEvent.click(screen.getByTestId('facet-search-result-Wetsuits'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPath', {
      path: ['Sporting Goods', 'Water Sports', 'Wetsuits'],
    });
  });

  it('shows a "+ Show more" button that dispatches showMoreValues when canShowMoreValues', () => {
    mockControllerState = {...stateWithChildren, canShowMoreValues: true, canShowLessValues: false};
    render(<CategoryFacetRenderer props={props} />);

    expect(screen.queryByTestId('facet-show-less-facet-category-1')).toBeNull();
    fireEvent.click(screen.getByTestId('facet-show-more-facet-category-1'));
    expect(mockDispatch).toHaveBeenCalledWith('showMoreValues', {});
  });

  it('shows a "- Show less" button that dispatches showLessValues when canShowLessValues', () => {
    mockControllerState = {...stateWithChildren, canShowMoreValues: true, canShowLessValues: true};
    render(<CategoryFacetRenderer props={props} />);

    fireEvent.click(screen.getByTestId('facet-show-less-facet-category-1'));
    expect(mockDispatch).toHaveBeenCalledWith('showLessValues', {});
  });

  it('renders "- Show less" above "+ Show more" when both are available', () => {
    mockControllerState = {...stateWithChildren, canShowMoreValues: true, canShowLessValues: true};
    const {container} = render(<CategoryFacetRenderer props={props} />);

    const buttons = Array.from(
      container.querySelectorAll(
        '[data-testid="facet-show-less-facet-category-1"], [data-testid="facet-show-more-facet-category-1"]'
      )
    );
    expect(buttons.map((b) => b.getAttribute('data-testid'))).toEqual([
      'facet-show-less-facet-category-1',
      'facet-show-more-facet-category-1',
    ]);
  });

  it('does not show value show-more/less controls while a facet search is active', () => {
    mockControllerState = {
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
    };
    render(<CategoryFacetRenderer props={props} />);

    expect(screen.queryByTestId('facet-show-more-facet-category-1')).toBeNull();
    expect(screen.queryByTestId('facet-show-less-facet-category-1')).toBeNull();
  });
});

describe('FacetManagerRenderer', () => {
  const props = {componentId: 'facet-manager-1', componentType: 'facet-manager' as const};

  function makeFacetProps(
    componentId: string,
    componentType: 'regular-facet' | 'numeric-facet' | 'category-facet'
  ): FacetProps {
    return {componentId, componentType};
  }

  // Superset state so each child renderer renders a distinguishable node keyed by its
  // own props.componentId. RegularFacet/NumericFacet iterate `values` as an array while
  // CategoryFacet destructures it as an object, so `values` is an empty array carrying
  // the category shape as attached properties to satisfy all three without crashing.
  const childrenValues = Object.assign([] as unknown[], {
    ancestry: [],
    selected: null,
    children: [],
  });
  const childrenState = {
    field: 'field',
    displayName: 'Facet',
    hasActiveValues: false,
    canShowMoreValues: false,
    canShowLessValues: false,
    values: childrenValues,
    customRange: null,
    facetSearch: {query: '', canShowMoreResults: false, results: []},
  };

  it('renders nothing when state is undefined', () => {
    mockControllerState = undefined;
    const childComponents = new Map<string, FacetProps>();
    const {container} = render(
      <FacetManagerRenderer props={props} childComponents={childComponents} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders children in facetIds order regardless of childComponents insertion order', () => {
    const facetIds = ['facet-category-1', 'facet-brand-1', 'facet-price-1'];
    // childComponents is built in a different (shuffled) order and with a different
    // catalog/insertion order than facetIds.
    const childComponents = new Map<string, FacetProps>([
      ['facet-price-1', makeFacetProps('facet-price-1', 'numeric-facet')],
      ['facet-brand-1', makeFacetProps('facet-brand-1', 'regular-facet')],
      ['facet-category-1', makeFacetProps('facet-category-1', 'category-facet')],
    ]);

    mockControllerState = {facetIds, ...childrenState};
    // The manager reads facetIds off its own state; the shared mock state also supplies
    // the fields each child renderer needs to render its container.
    render(<FacetManagerRenderer props={props} childComponents={childComponents} />);

    const rendered = screen.getAllByTestId(/^facet-(brand|price|category)-1$/);
    const renderedOrder = rendered.map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(facetIds);
  });

  it.each([
    ['facet-brand-1', 'facet-price-1', 'facet-category-1'],
    ['facet-price-1', 'facet-category-1', 'facet-brand-1'],
    ['facet-category-1', 'facet-brand-1', 'facet-price-1'],
    ['facet-price-1', 'facet-brand-1', 'facet-category-1'],
  ])('renders DOM order equal to facetIds for permutation %#', (...facetIds) => {
    const entries: [string, FacetProps][] = [
      ['facet-category-1', makeFacetProps('facet-category-1', 'category-facet')],
      ['facet-price-1', makeFacetProps('facet-price-1', 'numeric-facet')],
      ['facet-brand-1', makeFacetProps('facet-brand-1', 'regular-facet')],
    ];
    const childComponents = new Map<string, FacetProps>(entries);

    mockControllerState = {facetIds, ...childrenState};
    render(<FacetManagerRenderer props={props} childComponents={childComponents} />);

    const renderedOrder = screen
      .getAllByTestId(/^facet-(brand|price|category)-1$/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(facetIds);
  });

  it('skips facetIds with no resolvable child entry', () => {
    const facetIds = ['facet-brand-1', 'facet-unknown-1', 'facet-price-1'];
    const childComponents = new Map<string, FacetProps>([
      ['facet-brand-1', makeFacetProps('facet-brand-1', 'regular-facet')],
      ['facet-price-1', makeFacetProps('facet-price-1', 'numeric-facet')],
    ]);

    mockControllerState = {facetIds, ...childrenState};
    render(<FacetManagerRenderer props={props} childComponents={childComponents} />);

    const renderedOrder = screen
      .getAllByTestId(/^facet-(brand|price|category)-1$/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(['facet-brand-1', 'facet-price-1']);
    expect(screen.queryByTestId('facet-unknown-1')).toBeNull();
  });
});
