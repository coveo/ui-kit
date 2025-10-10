import {html, nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type ItemTextHighlightedProps,
  renderItemTextHighlighted,
} from './item-text-highlighted';
import {renderWithHighlights} from './render-highlights';

vi.mock('./render-highlights', {spy: true});

describe('#renderItemTextHighlighted', () => {
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

    const result = renderItemTextHighlighted({props});

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      'Hello world',
      [{offset: 6, length: 5}],
      props.highlightString
    );
    expect(result).toEqual(html`${unsafeHTML(expectedHighlightedValue)}`);
  });

  it('should call onError and return nothing when renderWithHighlights throws', () => {
    const error = new Error('Highlight error');
    mockRenderWithHighlights.mockImplementation(() => {
      throw error;
    });

    const result = renderItemTextHighlighted({props});

    expect(props.onError).toHaveBeenCalledWith(error);
    expect(result).toEqual(nothing);
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

    renderItemTextHighlighted({props: customProps});

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

    const result = renderItemTextHighlighted({props: emptyProps});

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

    const result = renderItemTextHighlighted({props: emptyHighlightsProps});

    expect(mockRenderWithHighlights).toHaveBeenCalledWith(
      'Hello world',
      [],
      props.highlightString
    );
    expect(result).toEqual(html`${unsafeHTML('Hello world')}`);
  });
});
