import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {html} from 'lit';
import {expect, vi, describe, beforeAll, it} from 'vitest';
import {FacetValueProps, renderFacetValue} from '../facet-value/facet-value';
import {renderFacetSearchValue} from './facet-search-value';

vi.mock('../facet-value/facet-value', {spy: true});

describe('renderFacetSearchValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (
    props: Partial<Omit<FacetValueProps, 'facetState' | 'setRef'>> = {}
  ) => {
    const mergedProps: Omit<FacetValueProps, 'facetState' | 'setRef'> = {
      field: 'author',
      facetValue: 'Test Value',
      facetCount: 42,
      i18n,
      enableExclusion: false,
      onExclude: vi.fn(),
      onSelect: vi.fn(),
      displayValuesAs: 'checkbox',
      facetSearchQuery: '',
      ...props,
    };

    return await renderFunctionFixture(
      html`${renderFacetSearchValue({props: mergedProps})}`
    );
  };

  it('renders the facet value in idle state', async () => {
    const renderFacetValueSpy = vi.mocked(renderFacetValue);
    await setupElement();
    expect(renderFacetValueSpy).toHaveBeenCalledWith({
      props: expect.objectContaining({
        field: 'author',
        facetValue: 'Test Value',
        facetCount: 42,
        enableExclusion: false,
        displayValuesAs: 'checkbox',
        facetSearchQuery: '',
        facetState: 'idle',
      }),
    });
  });
});
