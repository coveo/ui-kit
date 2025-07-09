import {html, nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils.js';
import {
  type HighlightKeywords,
  type HighlightString,
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
 * The renderItemTextHighlighted functional component renders text with highlighted keywords.
 */
export const renderItemTextHighlighted: FunctionalComponent<
  ItemTextHighlightedProps
> = ({props}) => {
  const {
    textValue,
    highlightKeywords,
    highlightString,
    onError = (error: Error) => console.error(error),
  } = props;
  try {
    const highlightedValue = renderWithHighlights(
      textValue,
      highlightKeywords,
      highlightString
    );

    return html`${unsafeHTML(highlightedValue)}`;
  } catch (error) {
    onError(error as Error);
    return nothing;
  }
};
