import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getPartialRecentQueryClearElement,
  getPartialRecentQueryElement,
  type RecentQueriesContainerProps,
  renderRecentQuery,
  renderRecentQueryClear,
} from './recent-queries';

describe('#getPartialRecentQueryElement', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  it('should return the "recent-query-item" part', () => {
    const result = getPartialRecentQueryElement('test', i18n);

    expect(result.part).toBe('recent-query-item');
  });

  it('should properly encode the value for the key', () => {
    const result = getPartialRecentQueryElement('test', i18n);

    expect(result.key).toBe('recent-test');
  });

  it('should return the correct aria-label', () => {
    const result = getPartialRecentQueryElement('test', i18n);

    expect(result.ariaLabel).toBe('“test”, recent query');
  });
});

describe('#getPartialRecentQueryClearElement', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  it('should return the "recent-query-title-item suggestion-divider" part', () => {
    const result = getPartialRecentQueryClearElement(i18n);

    expect(result.part).toBe('recent-query-title-item suggestion-divider');
  });

  it('should return the correct aria-label', () => {
    const result = getPartialRecentQueryClearElement(i18n);

    expect(result.ariaLabel).toBe('Clear recent searches');
  });

  it('should return the "recent-query-clear" key', () => {
    const result = getPartialRecentQueryClearElement(i18n);

    expect(result.key).toBe('recent-query-clear');
  });
});

describe('#renderRecentQuery', () => {
  const renderQuery = async (
    overrides: Partial<RecentQueriesContainerProps> = {}
  ) => {
    const props = {
      icon: 'test-icon',
      query: 'test',
      value: 'test-value',
      ...overrides,
    };
    return await fixture(html`${renderRecentQuery(props)}`);
  };

  it('should have the "recent-query-content" part on the container', async () => {
    const element = await renderQuery();
    expect(element).toHaveAttribute('part', 'recent-query-content');
  });

  it('should have the "recent-query-icon" part on the atomic-icon', async () => {
    const element = await renderQuery();
    const icon = element.querySelector('atomic-icon');
    expect(icon).toHaveAttribute('part', 'recent-query-icon');
  });

  it('should have the correct icon on the atomic-icon', async () => {
    const element = await renderQuery();
    const icon = element.querySelector('atomic-icon');
    expect(icon).toHaveAttribute('icon', 'test-icon');
  });

  describe('when the query is not empty', () => {
    it('should have the "recent-query-text" part on the span', async () => {
      const element = await renderQuery();
      const span = element.querySelector('span');
      expect(span).toHaveAttribute('part', 'recent-query-text');
    });

    it('should have the properly highlighted value based on the query', async () => {
      const element = await renderQuery();
      const highlighted = element.querySelector(
        '[part="recent-query-text-highlight"]'
      );

      expect(highlighted).toBeTruthy();
      expect(highlighted).toHaveTextContent('-value');
    });
  });

  describe('when the query is empty', () => {
    it('should have the "recent-query-text" part on the span', async () => {
      const element = await renderQuery({query: ''});
      const span = element.querySelector('span');
      expect(span).toHaveAttribute('part', 'recent-query-text');
    });

    it('should have the value as the text content of the span', async () => {
      const element = await renderQuery({query: ''});
      const span = element.querySelector('span');
      expect(span).toHaveTextContent('test-value');
    });
  });

  it('container should have pointer-events-none class to allow clicks on parent', async () => {
    const element = await renderQuery();

    expect(element).toHaveClass('pointer-events-none');
  });
});

describe('#renderRecentQueryClear', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderQueryClear = async () => {
    return await fixture(html`${renderRecentQueryClear({i18n})}`);
  };

  it('should have the "recent-query-title-content" part on the container', async () => {
    const element = await renderQueryClear();
    expect(element).toHaveAttribute('part', 'recent-query-title-content');
  });

  it('should have the "recent-query-title" part on the first span', async () => {
    const element = await renderQueryClear();
    const span = element.querySelector('span');
    expect(span).toHaveAttribute('part', 'recent-query-title');
  });

  it('should have the proper content on the first span', async () => {
    const element = await renderQueryClear();
    const span = element.querySelector('span');
    expect(span).toHaveTextContent('Recent searches');
  });

  it('should have the "recent-query-clear" part on the second span', async () => {
    const element = await renderQueryClear();
    const span = element.querySelector('span:nth-of-type(2)');
    expect(span).toHaveAttribute('part', 'recent-query-clear');
  });

  it('should have the proper content on the second span', async () => {
    const element = await renderQueryClear();
    const span = element.querySelector('span:nth-of-type(2)');
    expect(span).toHaveTextContent('Clear');
  });

  it('container should have pointer-events-none class to allow clicks on parent', async () => {
    const element = await renderQueryClear();

    expect(element).toHaveClass('pointer-events-none');
  });
});
