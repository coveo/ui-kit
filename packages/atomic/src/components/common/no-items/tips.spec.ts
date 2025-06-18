import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {describe, beforeAll, it, expect} from 'vitest';
import {renderSearchTips} from './tips';

describe('#renderSearchTips', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderSearchTips({
        props: {
          i18n,
          ...overrides,
        },
      })}`
    );

    return {
      searchTipsDiv: element.querySelector('div[part="search-tips"]'),
    };
  };

  it('should render the part "search-tips" on the div', async () => {
    const {searchTipsDiv} = await renderComponent();

    expect(searchTipsDiv).toHaveAttribute('part', 'search-tips');
  });

  it('should render the search-tips text from i18n', async () => {
    const {searchTipsDiv} = await renderComponent();

    expect(searchTipsDiv).toHaveTextContent(
      'You may want to try using different keywords, deselecting filters, or checking for spelling mistakes.'
    );
  });
});
