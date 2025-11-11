import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {highlightSearchResult} from '@/src/components/common/facets/facet-search/facet-search-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderFacetValueLabelHighlight} from './facet-value-label-highlight';

vi.mock('@/src/components/common/facets/facet-search/facet-search-utils', {
  spy: true,
});

describe('#renderFacetValueLabelHighlight', () => {
  const setupElement = async (props = {}) => {
    const baseProps = {
      displayValue: 'Test Value',
      isSelected: false,
      searchQuery: '',
      isExcluded: false,
      ...props,
    };
    return await renderFunctionFixture(
      html`${renderFacetValueLabelHighlight({props: baseProps})}`
    );
  };

  const locators = {
    get label() {
      return page.getByTitle('Test Value');
    },
  };

  it('renders the label with correct part', async () => {
    await setupElement();
    const {label} = locators;
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveAttribute('part', 'value-label');
  });

  it('renders the label without bold class', async () => {
    await setupElement();
    const {label} = locators;
    await expect(label).not.toHaveClass('font-bold');
  });

  it('sets the title attribute to displayValue', async () => {
    await setupElement({displayValue: 'My Title'});
    const label = page.getByTitle('My Title');
    await expect(label).toHaveAttribute('title', 'My Title');
  });

  it('applies font-bold class when isSelected is true', async () => {
    await setupElement({isSelected: true});
    const {label} = locators;
    await expect(label).toHaveClass('font-bold');
  });

  it('applies font-bold class when isExcluded is true', async () => {
    await setupElement({isExcluded: true});
    const {label} = locators;
    await expect(label).toHaveClass('font-bold');
  });

  it('renders highlighted HTML when searchQuery matches', async () => {
    const highlightSearchResultSpy = vi.mocked(highlightSearchResult);
    await setupElement({
      displayValue: 'Test Value',
      searchQuery: 'Test',
    });
    expect(highlightSearchResultSpy).toHaveBeenCalledWith('Test Value', 'Test');
  });
});
