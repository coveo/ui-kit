export type HighlightKeywords = {
  offset: number;
  length: number;
};

export type HighlightString = (params: {
  content: string;
  openingDelimiter: string;
  closingDelimiter: string;
  highlights: HighlightKeywords[];
}) => string;

export function renderWithHighlights(
  value: string,
  highlights: HighlightKeywords[],
  highlightString: HighlightString
) {
  const openingDelimiter = '_openingDelimiter_';
  const closingDelimiter = '_closingDelimiter_';
  const highlightedValue = highlightString({
    content: value,
    openingDelimiter,
    closingDelimiter,
    highlights,
  });
  return highlightedValue
    .replace(new RegExp(openingDelimiter, 'g'), '<b>')
    .replace(new RegExp(closingDelimiter, 'g'), '</b>');
}
