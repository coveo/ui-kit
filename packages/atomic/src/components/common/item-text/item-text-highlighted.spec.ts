import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  ItemTextHighlighted,
  ItemTextHighlightedProps,
} from './item-text-highlighted';
import {renderWithHighlights} from './render-highlights';

vi.mock('./render-highlights', () => ({
  renderWithHighlights: vi.fn(),
}));

describe('#ItemTextHighlighted', () => {
  let props: ItemTextHighlightedProps;
  let mockRenderWithHighlights: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRenderWithHighlights = vi.mocked(renderWithHighlights);
    props = {
      textValue: 'Hello world',
      highlightKeywords: [{offset: 6, length: 5}],
      highlightString: vi.fn(),
      onError: vi.fn(),
    };
  });

  it('should return highlighted HTML when renderWithHighlights succeeds', () => {
    const expectedHighlightedValue = 'Hello <b>world</b>';
    mockRenderWithHighlights.mockReturnValue(expectedHighlightedValue);

    const result = ItemTextHighlighted(props);

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      'Hello world',
      [{offset: 6, length: 5}],
      props.highlightString
    );
    expect(result).toEqual(html`${unsafeHTML(expectedHighlightedValue)}`);
  });

  it('should call onError and return empty template when renderWithHighlights throws', () => {
    const error = new Error('Highlight error');
    mockRenderWithHighlights.mockImplementation(() => {
      throw error;
    });

    const result = ItemTextHighlighted(props);

    expect(props.onError).toHaveBeenCalledWith(error);
    expect(result).toEqual(html``);
  });

  it('should use default onError when not provided', () => {
    const propsWithoutError = {
      ...props,
      onError: undefined,
    };
    const error = new Error('Highlight error');
    mockRenderWithHighlights.mockImplementation(() => {
      throw error;
    });

    const result = ItemTextHighlighted(propsWithoutError);

    // Should not throw and return empty template
    expect(result).toEqual(html``);
  });

  it('should pass through all parameters correctly', () => {
    const customHighlightKeywords = [
      {offset: 0, length: 5},
      {offset: 10, length: 3},
    ];
    const customHighlightString = vi.fn();
    const customProps = {
      ...props,
      textValue: 'Custom text content',
      highlightKeywords: customHighlightKeywords,
      highlightString: customHighlightString,
    };

    mockRenderWithHighlights.mockReturnValue('highlighted content');

    ItemTextHighlighted(customProps);

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      'Custom text content',
      customHighlightKeywords,
      customHighlightString
    );
  });

  it('should handle empty text value', () => {
    const emptyProps = {
      ...props,
      textValue: '',
    };

    mockRenderWithHighlights.mockReturnValue('');

    const result = ItemTextHighlighted(emptyProps);

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      '',
      props.highlightKeywords,
      props.highlightString
    );
    expect(result).toEqual(html`${unsafeHTML('')}`);
  });

  it('should handle empty highlight keywords', () => {
    const emptyHighlightsProps = {
      ...props,
      highlightKeywords: [],
    };

    mockRenderWithHighlights.mockReturnValue('Hello world');

    const result = ItemTextHighlighted(emptyHighlightsProps);

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      'Hello world',
      [],
      props.highlightString
    );
    expect(result).toEqual(html`${unsafeHTML('Hello world')}`);
  });
});
