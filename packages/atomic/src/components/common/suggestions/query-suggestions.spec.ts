import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {i18n as I18n} from 'i18next';
import {html} from 'lit';
import {describe, it, expect, vi, beforeAll} from 'vitest';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import {
  getPartialSearchBoxSuggestionElement,
  renderQuerySuggestion,
  RenderQuerySuggestionOptions,
} from './query-suggestions';

vi.mock('../../../utils/string-utils', () => ({
  encodeForDomAttribute: vi.fn((value) => value),
}));

describe('#getPartialSearchBoxSuggestionElement', () => {
  let i18n: I18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  it('should return the correct object structure', () => {
    const mockSuggestion = {
      highlightedValue: 'Highlighted Value',
      rawValue: 'Raw Value',
    };

    const result = getPartialSearchBoxSuggestionElement(mockSuggestion, i18n);

    expect(result).toEqual({
      part: 'query-suggestion-item',
      key: 'qs-Raw Value',
      query: 'Raw Value',
      ariaLabel: '“Raw Value”, suggested query',
    });
  });

  it('should call encodeForDomAttribute with the rawValue', () => {
    const mockSuggestion = {
      highlightedValue: 'Highlighted Value',
      rawValue: 'Raw Value',
    };

    getPartialSearchBoxSuggestionElement(mockSuggestion, i18n);

    expect(encodeForDomAttribute).toHaveBeenCalledWith('Raw Value');
  });
});

describe('#renderQuerySuggestion', () => {
  const defaultProps: RenderQuerySuggestionOptions = {
    icon: 'icon',
    hasQuery: true,
    suggestion: {highlightedValue: 'highlighted', rawValue: 'raw'},
    hasMultipleKindOfSuggestions: true,
  };

  const renderSuggestion = async (
    overrides: Partial<RenderQuerySuggestionOptions> = {}
  ) => {
    const props = {...defaultProps, ...overrides};
    return await fixture(html`${renderQuerySuggestion(props)}`);
  };

  it('container should have the correct part attribute', async () => {
    const suggestion = await renderSuggestion();

    expect(suggestion).toBeInTheDocument();

    expect(suggestion).toHaveAttribute('part', 'query-suggestion-content');
  });

  it('should render the icon if hasMultipleKindOfSuggestions is true', async () => {
    const suggestion = await renderSuggestion({
      hasMultipleKindOfSuggestions: true,
    });

    const icon = suggestion.querySelector('atomic-icon');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('part', 'query-suggestion-icon');
    expect(icon).toHaveAttribute('icon', 'icon');
  });

  it('should not render the icon if hasMultipleKindOfSuggestions is false', async () => {
    const suggestion = await renderSuggestion({
      hasMultipleKindOfSuggestions: false,
    });

    const icon = suggestion.querySelector('atomic-icon');

    expect(icon).not.toBeInTheDocument();
  });

  it('should render the highlighted value if hasQuery is true', async () => {
    const suggestion = await renderSuggestion({hasQuery: true});

    const text = suggestion.querySelector('span');

    expect(text).toBeInTheDocument();
    expect(text).toHaveAttribute('part', 'query-suggestion-text');
    expect(text).toHaveTextContent('highlighted');
  });

  it('should render the raw value if hasQuery is false', async () => {
    const suggestion = await renderSuggestion({hasQuery: false});

    const text = suggestion.querySelector('span');

    expect(text).toBeInTheDocument();
    expect(text).toHaveAttribute('part', 'query-suggestion-text');
    expect(text).toHaveTextContent('raw');
  });
});
