import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getPartialRecentQueryClearAction,
  getPartialRecentQueryElement,
  type RecentQueriesContainerProps,
  renderRecentQuery,
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

describe('#getPartialRecentQueryClearAction', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  it('should return the "recent-query-clear" part', () => {
    const result = getPartialRecentQueryClearAction(i18n);

    expect(result.part).toBe('recent-query-clear');
  });

  it('should return the "Clear recent searches" label', () => {
    const result = getPartialRecentQueryClearAction(i18n);

    expect(result.label).toBe('Clear recent searches');
  });
});

describe('#renderRecentQuery', () => {
  const renderQuery = async (overrides: Partial<RecentQueriesContainerProps> = {}) => {
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
      const highlighted = element.querySelector('[part="recent-query-text-highlight"]');

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
