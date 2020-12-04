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

export function highlightSuggestion(
  suggestion: string,
  openingMatchDelimiter: string,
  closingMatchDelimiter: string,
  openingCorrectedDelimiter: string,
  closingCorrectedDelimiter: string
) {
  return suggestion.replace(
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
