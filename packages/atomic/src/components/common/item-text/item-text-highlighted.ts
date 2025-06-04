import {html, TemplateResult} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {
  HighlightKeywords,
  HighlightString,
  renderWithHighlights,
} from './render-highlights.js';

export interface ItemTextHighlightedProps {
  /**
   * The text value to display with highlights.
   */
  textValue: string;
  /**
   * The keywords to highlight in the text.
   */
  highlightKeywords: HighlightKeywords[];
  /**
   * The function used to highlight strings.
   */
  highlightString: HighlightString;
  /**
   * Error callback function.
   */
  onError?: (error: Error) => void;
}

/**
 * The ItemTextHighlighted functional component renders text with highlighted keywords.
 */
export function ItemTextHighlighted({
  textValue,
  highlightKeywords,
  highlightString,
  onError = () => {},
}: ItemTextHighlightedProps): TemplateResult {
  try {
    const highlightedValue = renderWithHighlights(
      textValue,
      highlightKeywords,
      highlightString
    );

    return html`${unsafeHTML(highlightedValue)}`;
  } catch (error) {
    onError(error as Error);
    return html``;
  }
}
