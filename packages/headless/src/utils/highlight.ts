import {isNullOrUndefined} from '@coveo/bueno';

export interface HighlightKeyword {
  /**
   * The 0 based offset inside the string where the highlight should start.
   */
  offset: number;
  /**
   * The length of the offset.
   */
  length: number;
}

export interface HighlightParams {
  /**
   * The string to highlight items in.
   */
  content: string;
  /**
   * The highlighted positions to highlight in the string.
   */
  highlights: HighlightKeyword[];
  /**
   * The opening delimiter used when starting to highlight.
   */
  openingDelimiter: string;
  /**
   * The closing delimiter used to close highlighted section.
   */
  closingDelimiter: string;
}

function isEmptyString(str: string) {
  return str === '';
}

/**
 * Highlight the passed string using specified highlights.
 */
export function highlightString(params: HighlightParams): string {
  if (
    isEmptyString(params.openingDelimiter) ||
    isEmptyString(params.closingDelimiter)
  ) {
    throw Error('delimiters should be a non-empty string');
  }

  if (isNullOrUndefined(params.content) || isEmptyString(params.content)) {
    return params.content;
  }
  const maxIndex = params.content.length;
  let highlighted = '';
  let last = 0;
  for (let i = 0; i < params.highlights.length; i++) {
    const highlight = params.highlights[i];
    const start: number = highlight.offset;
    const end: number = start + highlight.length;

    if (end > maxIndex) {
      break;
    }

    highlighted += params.content.slice(last, start);
    highlighted += params.openingDelimiter;
    highlighted += params.content.slice(start, end);
    highlighted += params.closingDelimiter;

    last = end;
  }
  if (last !== maxIndex) {
    highlighted += params.content.slice(last);
  }
  return highlighted;
}

/**
 * Add delimiters to a highlighted suggestion.
 *
 * @param highlightedSuggestion The highlighted suggestion
 * @param openingMatchDelimiter The opening delimiter for a match in the suggestion string (e.g. '<strong>')
 * @param closingMatchDelimiter The closing delimiter for a match in the suggestion string (e.g. '</strong>')
 * @param openingCorrectedDelimiter The opening delimiter for a correction in the suggestion string (e.g. '<i>')
 * @param closingCorrectedDelimiter The closing delimiter for a correction in the suggestion string (e.g. '</i>')
 */

export function formatHighlightedSuggestion(
  highlightedSuggestion: string,
  openingMatchDelimiter: string,
  closingMatchDelimiter: string,
  openingCorrectedDelimiter: string,
  closingCorrectedDelimiter: string
) {
  if (
    isEmptyString(openingMatchDelimiter) ||
    isEmptyString(closingMatchDelimiter) ||
    isEmptyString(openingCorrectedDelimiter) ||
    isEmptyString(closingCorrectedDelimiter)
  ) {
    throw Error('delimiters should be a non-empty string');
  }
  return highlightedSuggestion.replace(
    /\[(.*?)\]|\{(.*?)\}|\((.*?)\)/g,
    (_, notMatched, matched, corrected) => {
      if (notMatched) {
        return notMatched;
      }
      if (matched) {
        return openingMatchDelimiter + matched + closingMatchDelimiter;
      }
      if (corrected) {
        return (
          openingCorrectedDelimiter + corrected + closingCorrectedDelimiter
        );
      }
    }
  );
}
