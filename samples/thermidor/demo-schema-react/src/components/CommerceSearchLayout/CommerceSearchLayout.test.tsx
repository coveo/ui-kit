import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CommerceSearchLayout} from '../CommerceSearchLayout/CommerceSearchLayout.js';

/**
 * Feature: commerce-surface-decomposition, Property 6: Partial component set handling
 *
 * **Validates: Requirements 3.7, 6.3**
 *
 * For any commerceSearch surface that includes only a subset of the four
 * decomposed components, the layout template SHALL render the available
 * components without error, rendering absent slots as empty.
 */

let mockSurface: {componentsModel: {entries: Map<string, ComponentModel>}} | undefined;
let mockVersion = 0;

interface ComponentModel {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

vi.mock('@copilotkit/a2ui-renderer', () => ({
  useA2UI: () => ({
    getSurface: () => mockSurface,
    clearSurfaces: () => {},
    processMessages: () => {},
    version: mockVersion,
  }),
}));

vi.mock('../../a2ui/state-source-context.js', () => ({
  useStateSource: () => ({
    state: {activeTurn: undefined},
    subscribe: () => () => {},
  }),
}));

vi.mock('../../a2ui/controllers.js', () => ({
  useRemoteController: () => ({
    state: null,
    dispatch: vi.fn(),
    subscribe: () => () => {},
  }),
}));

vi.mock('../../a2ui/surfaces.js', () => ({
  getA2UIMessages: () => [],
}));

vi.mock('../../a2ui/ProductList/ProductList.js', () => ({
  ProductListRenderer: ({props}: {props: {componentId: string}}) => (
    <div data-testid={`product-list-${props.componentId}`}>ProductList</div>
  ),
}));

vi.mock('../../a2ui/Pagination/Pagination.js', () => ({
  PaginationRenderer: ({props}: {props: {componentId: string}}) => (
    <div data-testid={`pagination-${props.componentId}`}>Pagination</div>
  ),
}));

vi.mock('../../a2ui/Sort/Sort.js', () => ({
  SortRenderer: ({props}: {props: {componentId: string}}) => (
    <div data-testid={`sort-${props.componentId}`}>Sort</div>
  ),
}));

vi.mock('../../a2ui/SearchBox/SearchBox.js', () => ({
  SearchBoxRenderer: ({props}: {props: {componentId: string}}) => (
    <div data-testid={`search-box-${props.componentId}`}>SearchBox</div>
  ),
}));

vi.mock('./CommerceSearchLayout.module.css', () => ({
  default: {
    layout: 'layout',
    header: 'header',
    main: 'main',
    sortSlot: 'sortSlot',
    productListSlot: 'productListSlot',
    paginationSlot: 'paginationSlot',
  },
}));

const ALL_COMPONENT_TYPES = ['search-box', 'product-list', 'pagination', 'sort'] as const;

/**
 * Components that are rendered as visible DOM elements with data-testid attributes.
 * search-box is NOT rendered directly — its state is consumed by QuerySummary.
 */
const RENDERED_COMPONENT_TYPES = ['product-list', 'pagination', 'sort'] as const;

function buildSurface(componentTypes: string[]): typeof mockSurface {
  const entries = new Map<string, ComponentModel>();
  for (const type of componentTypes) {
    const id = `${type}-1`;
    entries.set(id, {
      id,
      type,
      properties: {componentId: id, componentType: type},
    });
  }
  return {componentsModel: {entries}};
}

beforeEach(() => {
  mockSurface = undefined;
  mockVersion = 0;
});

describe('Feature: commerce-surface-decomposition, Property 6: Partial component set handling', () => {
  it('renders all four components when all are present', () => {
    mockSurface = buildSurface([...ALL_COMPONENT_TYPES]);
    render(<CommerceSearchLayout surfaceId="test-surface" />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.getByTestId('product-list-product-list-1')).toBeDefined();
    expect(screen.getByTestId('pagination-pagination-1')).toBeDefined();
    expect(screen.getByTestId('sort-sort-1')).toBeDefined();
  });

  it('renders only product-list and pagination without error when search-box and sort are absent', () => {
    mockSurface = buildSurface(['product-list', 'pagination']);
    render(<CommerceSearchLayout surfaceId="test-surface" />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.getByTestId('product-list-product-list-1')).toBeDefined();
    expect(screen.getByTestId('pagination-pagination-1')).toBeDefined();
    expect(screen.queryByTestId('sort-sort-1')).toBeNull();
  });

  it('renders only search-box without error when all others are absent', () => {
    mockSurface = buildSurface(['search-box']);
    render(<CommerceSearchLayout surfaceId="test-surface" />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.queryByTestId('product-list-product-list-1')).toBeNull();
    expect(screen.queryByTestId('pagination-pagination-1')).toBeNull();
    expect(screen.queryByTestId('sort-sort-1')).toBeNull();
  });

  it('renders empty layout without error when no components are present', () => {
    mockSurface = buildSurface([]);
    render(<CommerceSearchLayout surfaceId="test-surface" />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.queryByTestId('product-list-product-list-1')).toBeNull();
    expect(screen.queryByTestId('pagination-pagination-1')).toBeNull();
    expect(screen.queryByTestId('sort-sort-1')).toBeNull();
  });

  it('renders only sort and product-list without error when search-box and pagination are absent', () => {
    mockSurface = buildSurface(['sort', 'product-list']);
    render(<CommerceSearchLayout surfaceId="test-surface" />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.getByTestId('sort-sort-1')).toBeDefined();
    expect(screen.getByTestId('product-list-product-list-1')).toBeDefined();
    expect(screen.queryByTestId('search-box-search-box-1')).toBeNull();
    expect(screen.queryByTestId('pagination-pagination-1')).toBeNull();
  });

  it('renders null when surface is not found', () => {
    mockSurface = undefined;
    const {container} = render(<CommerceSearchLayout surfaceId="non-existent" />);

    expect(container.innerHTML).toBe('');
  });

  describe('exhaustive power-set: all 16 subsets of 4 components render without error', () => {
    /**
     * Validates: Requirements 3.7, 6.3
     *
     * Iterates over all 2^4 = 16 possible subsets of the decomposed component
     * set and verifies:
     * 1. No error is thrown during render
     * 2. Present components appear in the DOM (for rendered types)
     * 3. Absent components do not appear in the DOM
     */
    function generatePowerSet<T>(items: readonly T[]): T[][] {
      const result: T[][] = [];
      const total = 1 << items.length;
      for (let mask = 0; mask < total; mask++) {
        const subset: T[] = [];
        for (let i = 0; i < items.length; i++) {
          if (mask & (1 << i)) {
            subset.push(items[i]);
          }
        }
        result.push(subset);
      }
      return result;
    }

    const allSubsets = generatePowerSet(ALL_COMPONENT_TYPES);

    it.each(allSubsets.map((subset) => [subset.join(', ') || '(empty)', subset]))(
      'subset [%s] renders correctly',
      (_label, subset) => {
        mockSurface = buildSurface(subset as string[]);
        const {container} = render(<CommerceSearchLayout surfaceId="test-surface" />);

        expect(container.querySelector('[data-testid="commerce-search-layout"]')).not.toBeNull();

        for (const componentType of RENDERED_COMPONENT_TYPES) {
          const testId = `${componentType}-${componentType}-1`;
          if ((subset as string[]).includes(componentType)) {
            expect(
              container.querySelector(`[data-testid="${testId}"]`),
              `Expected ${componentType} to be rendered`
            ).not.toBeNull();
          } else {
            expect(
              container.querySelector(`[data-testid="${testId}"]`),
              `Expected ${componentType} to NOT be rendered`
            ).toBeNull();
          }
        }
      }
    );
  });

  describe('facets sidebar placeholder', () => {
    it('renders the non-interactive "Facets (coming soon)" placeholder', () => {
      mockSurface = buildSurface(['product-list']);
      const {container} = render(<CommerceSearchLayout surfaceId="test-surface" />);

      const sidebar = screen.getByText('Facets (coming soon)').closest('aside')!;
      expect(sidebar).not.toBeNull();
      expect(sidebar.getAttribute('role')).toBeNull();
      expect(sidebar.getAttribute('tabindex')).toBeNull();
      expect(container.querySelector('[role="status"]')).toBeNull();
    });
  });

  describe('slot placement correctness', () => {
    it('sort, product-list, and pagination render in the main slot', () => {
      mockSurface = buildSurface(['sort', 'product-list', 'pagination']);
      const {container} = render(<CommerceSearchLayout surfaceId="test-surface" />);

      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expect(main!.querySelector('[data-testid="sort-sort-1"]')).not.toBeNull();
      expect(main!.querySelector('[data-testid="product-list-product-list-1"]')).not.toBeNull();
      expect(main!.querySelector('[data-testid="pagination-pagination-1"]')).not.toBeNull();
    });

    it('search-box is not rendered as a visible component (state consumed by QuerySummary)', () => {
      mockSurface = buildSurface(['search-box', 'product-list', 'pagination', 'sort']);
      const {container} = render(<CommerceSearchLayout surfaceId="test-surface" />);

      expect(container.querySelector('[data-testid="search-box-search-box-1"]')).toBeNull();
      expect(container.querySelector('header')).toBeNull();
    });
  });
});
