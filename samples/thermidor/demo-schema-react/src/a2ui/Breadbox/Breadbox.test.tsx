import {describe, it, expect, afterEach} from 'vitest';
import {act, screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import type {BreadboxFacet} from '@coveo/thermidor-schema/zod3';
import {mountSurface} from '../mount-surface.harness.js';
import {limitPath} from './breadbox-values.js';

afterEach(() => cleanup());

const BRAND: BreadboxFacet = {
  facetId: 'regular-facet-2',
  field: 'ec_brand',
  displayName: 'Brand',
  type: 'regular',
  values: [
    {value: 'Billabong', state: 'selected'},
    {value: 'Aqua Marina', state: 'excluded'},
  ],
};

const PRICE: BreadboxFacet = {
  facetId: 'numeric-facet-2',
  field: 'ec_price',
  displayName: 'Price',
  type: 'numericalRange',
  values: [{start: 0, end: 50}],
};

const RELEASE_DATE: BreadboxFacet = {
  facetId: 'date-facet-2',
  field: 'ec_release_date',
  displayName: 'Release date',
  type: 'dateRange',
  values: [{start: '2026/01/01@00:00:00', end: '2026/02/01@00:00:00'}],
};

const CATEGORY: BreadboxFacet = {
  facetId: 'category-facet-2',
  field: 'ec_category',
  displayName: 'Category',
  type: 'hierarchical',
  path: ['Water Sports', 'Surfing', 'Boards', 'Shortboards'],
};

function mountBreadbox(facets: BreadboxFacet[], dispatchGate?: () => Promise<void> | void) {
  return mountSurface({
    component: {component: 'Breadbox', facets: {path: '/state/root/facets'}},
    dataModel: [{path: '/state/root/facets', value: facets}],
    dispatchGate,
  });
}

function removeButton(name: RegExp) {
  return screen.getByRole('button', {name});
}

describe('Breadbox', () => {
  it('renders nothing when no facet is active', async () => {
    const {container} = mountBreadbox([]);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container.querySelector('section')).toBeNull();
  });

  it('renders one group per active facet with its display name and values', async () => {
    mountBreadbox([BRAND, PRICE, RELEASE_DATE, CATEGORY]);

    await waitFor(() => expect(screen.getByRole('region', {name: 'Active filters'})).toBeDefined());
    expect(screen.getByTestId('breadbox-regular-facet-2').textContent).toContain('Brand:');
    expect(removeButton(/inclusion filter on Brand: Billabong/)).toBeDefined();
    expect(removeButton(/inclusion filter on Price: \$0 – \$50/)).toBeDefined();
    expect(removeButton(/inclusion filter on Release date: 2026-01-01 – 2026-02-01/)).toBeDefined();
    expect(
      removeButton(/inclusion filter on Category: Water Sports \/ \.\.\. \/ Boards \/ Shortboards/)
    ).toBeDefined();
  });

  it('shows an excluded value distinctly', async () => {
    mountBreadbox([BRAND]);

    await waitFor(() =>
      expect(removeButton(/exclusion filter on Brand: Aqua Marina/)).toBeDefined()
    );
    expect(removeButton(/exclusion filter on Brand: Aqua Marina/).className).toMatch(/excluded/);
    expect(removeButton(/inclusion filter on Brand: Billabong/).className).not.toMatch(/excluded/);
  });

  it.each([
    [/Brand: Aqua Marina/, {facetId: 'regular-facet-2', type: 'regular', value: 'Aqua Marina'}],
    [/Price: /, {facetId: 'numeric-facet-2', type: 'numericalRange', start: 0, end: 50}],
    [
      /Release date: /,
      {
        facetId: 'date-facet-2',
        type: 'dateRange',
        start: '2026/01/01@00:00:00',
        end: '2026/02/01@00:00:00',
      },
    ],
    [/Category: /, {facetId: 'category-facet-2', type: 'hierarchical', path: CATEGORY.path}],
  ])('dispatches deselect for %s', async (name, context) => {
    const {lastAction} = mountBreadbox([BRAND, PRICE, RELEASE_DATE, CATEGORY]);

    await waitFor(() => expect(removeButton(name)).toBeDefined());
    fireEvent.click(removeButton(name));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'deselect', context}));
  });

  it('dispatches clearAll', async () => {
    const {lastAction} = mountBreadbox([BRAND, PRICE]);

    await waitFor(() => expect(screen.getByRole('button', {name: 'Clear all'})).toBeDefined());
    fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
    await waitFor(() => expect(lastAction()).toMatchObject({name: 'clearAll'}));
  });

  it('removes a value before the backend answers, then follows the response', async () => {
    let answer!: () => void;
    const pending = new Promise<void>((resolve) => (answer = resolve));
    const {pushDataModel} = mountBreadbox([BRAND, PRICE], () => pending);

    await waitFor(() => expect(removeButton(/Brand: Billabong/)).toBeDefined());
    fireEvent.click(removeButton(/Brand: Billabong/));
    await waitFor(() =>
      expect(screen.queryByRole('button', {name: /Brand: Billabong/})).toBeNull()
    );
    expect(removeButton(/Brand: Aqua Marina/)).toBeDefined();

    await act(async () => {
      answer();
      await Promise.resolve();
    });
    pushDataModel([
      {path: '/state/root/facets', value: [{...BRAND, values: [BRAND.values[1]]}, PRICE]},
    ]);
    await waitFor(() =>
      expect(screen.queryByRole('button', {name: /Brand: Billabong/})).toBeNull()
    );
    expect(removeButton(/Price: /)).toBeDefined();
  });

  it('drops a facet whose last value is removed', async () => {
    mountBreadbox([PRICE, CATEGORY], () => new Promise<void>(() => {}));

    await waitFor(() => expect(removeButton(/Price: /)).toBeDefined());
    fireEvent.click(removeButton(/Price: /));
    await waitFor(() => expect(screen.queryByTestId('breadbox-numeric-facet-2')).toBeNull());
    expect(screen.getByTestId('breadbox-category-facet-2')).toBeDefined();
  });

  it('hides itself as soon as everything is cleared', async () => {
    const {container} = mountBreadbox([BRAND, PRICE], () => new Promise<void>(() => {}));

    await waitFor(() => expect(screen.getByRole('button', {name: 'Clear all'})).toBeDefined());
    fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
    await waitFor(() => expect(container.querySelector('section')).toBeNull());
  });
});

describe('limitPath', () => {
  it('keeps a short path whole', () => {
    expect(limitPath(['Water Sports', 'Surfing'])).toBe('Water Sports / Surfing');
  });

  it('keeps the root and the last values of a long path', () => {
    expect(limitPath(['A', 'B', 'C', 'D', 'E'])).toBe('A / ... / D / E');
  });
});
