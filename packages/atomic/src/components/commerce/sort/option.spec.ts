import {SortBy, type SortCriterion} from '@coveo/headless/commerce';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderSortOption as renderCommonSortOption} from '@/src/components/common/sort/option';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CommerceSortOptionProps,
  getLabel,
  getSortByLabel,
  renderCommerceSortOption,
} from './option';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/components/common/sort/option', {spy: true});

describe('#renderCommerceSortOption', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = (props?: Partial<CommerceSortOptionProps>) => {
    renderCommerceSortOption({
      props: {
        i18n,
        sort: props?.sort || {by: SortBy.Relevance},
        selected: props?.selected || false,
      },
    });
  };

  it('call renderSortOption with the default props for relevance', async () => {
    const renderSortOptionSpy = vi.mocked(renderCommonSortOption);
    setupElement();
    expect(renderSortOptionSpy).toHaveBeenCalledWith({
      props: {
        sort: {by: SortBy.Relevance},
        label: 'relevance',
        value: 'relevance',
        selected: false,
        i18n,
      },
    });
    renderSortOptionSpy.mockRestore();
  });

  it('returns "relevance" for relevance sort', () => {
    const sort: SortCriterion = {by: SortBy.Relevance};
    const label = getLabel(sort);

    expect(label).toBe('relevance');
  });

  it('#getLabel returns a concatenated label for fields sort', () => {
    const sort: SortCriterion = {
      by: SortBy.Fields,
      fields: [
        {name: 'price', displayName: 'Price'},
        {name: 'rating', displayName: 'Rating'},
      ],
    };

    const label = getLabel(sort);

    expect(label).toBe('Price Rating');
  });

  it('#getLabel returns field names if displayName is not provided', () => {
    const sort: SortCriterion = {
      by: SortBy.Fields,
      fields: [{name: 'price'}, {name: 'rating'}],
    };

    const label = getLabel(sort);

    expect(label).toBe('price rating');
  });

  it('#getSortByLabel returns the correct SortCriterion for a given label', () => {
    const availableSorts: SortCriterion[] = [
      {by: SortBy.Relevance},
      {
        by: SortBy.Fields,
        fields: [
          {name: 'price', displayName: 'Price'},
          {name: 'rating', displayName: 'Rating'},
        ],
      },
    ];

    const sort = getSortByLabel('Price Rating', availableSorts);

    expect(sort).toEqual({
      by: SortBy.Fields,
      fields: [
        {name: 'price', displayName: 'Price'},
        {name: 'rating', displayName: 'Rating'},
      ],
    });
  });

  it('#getSortByLabel returns undefined if the label does not match any available sort', () => {
    const availableSorts: SortCriterion[] = [
      {by: SortBy.Relevance},
      {
        by: SortBy.Fields,
        fields: [
          {name: 'price', displayName: 'Price'},
          {name: 'rating', displayName: 'Rating'},
        ],
      },
    ];

    const sort = getSortByLabel('Nonexistent Label', availableSorts);

    expect(sort).toBeUndefined();
  });
});
