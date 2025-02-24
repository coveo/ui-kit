import {HighlightKeyword} from '@coveo/headless/commerce';

export function highlightKeywords(
  text: string,
  highlights: HighlightKeyword[]
) {
  let highlightedText = '';
  let currentIndex = 0;

  highlights.forEach((highlight) => {
    highlightedText += text.slice(currentIndex, highlight.offset);
    highlightedText += `<mark>${text.slice(
      highlight.offset,
      highlight.offset + highlight.length
    )}</mark>`;
    currentIndex = highlight.offset + highlight.length;
  });

  highlightedText += text.slice(currentIndex);

  return {__html: highlightedText};
}
