import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicSearchBoxRecentQueries} from './atomic-search-box-recent-queries';
import './atomic-search-box-recent-queries';

vi.mock('@coveo/headless', {spy: true});

vi.mock('../../../utils/local-storage-utils', () => ({
  SafeStorage: vi.fn().mockImplementation(() => ({
    getParsedJSON: vi.fn().mockReturnValue(['query1', 'query2', 'query3']),
    setJSON: vi.fn(),
    removeItem: vi.fn(),
  })),
  StorageItems: {
    RECENT_QUERIES: 'recent-queries',
  },
}));

vi.mock('../../../utils/utils', () => ({
  once: (fn: () => void) => fn,
}));

vi.mock('../../common/suggestions/suggestions-events', () => ({
  dispatchSearchBoxSuggestionsEvent: vi.fn(),
}));

describe('AtomicSearchBoxRecentQueries', () => {
  const renderComponent = async (
    props: {icon?: string; maxWithQuery?: number; maxWithoutQuery?: number} = {}
  ) => {
    const element = await fixture<AtomicSearchBoxRecentQueries>(
      html`<atomic-search-box-recent-queries></atomic-search-box-recent-queries>`
    );

    if (props.icon !== undefined) element.icon = props.icon;
    if (props.maxWithQuery !== undefined)
      element.maxWithQuery = props.maxWithQuery;
    if (props.maxWithoutQuery !== undefined)
      element.maxWithoutQuery = props.maxWithoutQuery;

    await element.updateComplete;

    return element;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
    expect(element.tagName.toLowerCase()).toBe(
      'atomic-search-box-recent-queries'
    );
  });

  it('should render with default properties', async () => {
    const element = await renderComponent();
    expect(element.maxWithQuery).toBe(3);
    expect(element.maxWithoutQuery).toBeUndefined();
    expect(element.icon).toBeUndefined();
  });

  it('should update maxWithQuery when property changes', async () => {
    const element = await renderComponent({maxWithQuery: 5});
    expect(element.maxWithQuery).toBe(5);
  });

  it('should update maxWithoutQuery when property changes', async () => {
    const element = await renderComponent({maxWithoutQuery: 2});
    expect(element.maxWithoutQuery).toBe(2);
  });

  it('should update icon when property changes', async () => {
    const customIcon = 'custom-icon.svg';
    const element = await renderComponent({icon: customIcon});
    expect(element.icon).toBe(customIcon);
  });

  it('should have empty render method', async () => {
    const element = await renderComponent();
    const rendered = element.render();
    // In Lit, 'nothing' is the equivalent of returning null/empty
    expect(rendered.toString()).toBe('Symbol(lit-nothing)');
  });

  describe('when component connects', () => {
    it('should dispatch search box suggestions event', async () => {
      const {dispatchSearchBoxSuggestionsEvent} = await import(
        '../../common/suggestions/suggestions-events'
      );

      await renderComponent();

      expect(dispatchSearchBoxSuggestionsEvent).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Element),
        ['atomic-search-box']
      );
    });

    it('should handle errors during initialization', async () => {
      const {dispatchSearchBoxSuggestionsEvent} = await import(
        '../../common/suggestions/suggestions-events'
      );

      vi.mocked(dispatchSearchBoxSuggestionsEvent).mockImplementation(() => {
        throw new Error('Test initialization error');
      });

      const element = await renderComponent();

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('Test initialization error');
    });
  });

  describe('when using custom icon', () => {
    it('should store custom icon property', async () => {
      const customIcon = 'assets://custom-clock.svg';
      const element = await renderComponent({icon: customIcon});

      expect(element.icon).toBe(customIcon);
    });

    it('should have undefined icon when not provided', async () => {
      const element = await renderComponent();

      expect(element.icon).toBeUndefined();
    });
  });

  describe('when setting max properties', () => {
    it('should respect maxWithQuery setting', async () => {
      const element = await renderComponent({maxWithQuery: 7});

      expect(element.maxWithQuery).toBe(7);
    });

    it('should respect maxWithoutQuery setting', async () => {
      const element = await renderComponent({maxWithoutQuery: 5});

      expect(element.maxWithoutQuery).toBe(5);
    });

    it('should use default maxWithQuery when not specified', async () => {
      const element = await renderComponent();

      expect(element.maxWithQuery).toBe(3);
    });
  });

  describe('when error state is set', () => {
    it('should store error information', async () => {
      const element = await renderComponent();
      const testError = new Error('Test error');

      element.error = testError;

      expect(element.error).toBe(testError);
      expect(element.error.message).toBe('Test error');
    });
  });
});
