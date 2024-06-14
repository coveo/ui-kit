import {FunctionalComponent, h, Host} from '@stencil/core';
import {
  HighlightKeywords,
  HighlightString,
  renderWithHighlights,
} from './render-highlights';

export interface ItemTextHighlightedProps {
  textValue: string;
  highlightKeywords: HighlightKeywords[];
  onError: (error: Error) => void;
  highlightString: HighlightString;
}

export const ItemTextHighlighted: FunctionalComponent<
  ItemTextHighlightedProps
> = ({highlightKeywords, highlightString, onError, textValue}) => {
  try {
    const highlightedValue = renderWithHighlights(
      textValue,
      highlightKeywords,
      highlightString
    );

    // deepcode ignore ReactSetInnerHtml: This is not React code
    return <Host innerHTML={highlightedValue}></Host>;
  } catch (error) {
    onError(error as Error);
  }
};
