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

interface OpenCloseDelimiters {
  /**
   * Opening delimiter
   */
  opening: string;

  /**
   * Closing delimiter
   */
  closing: string;
}

export interface SuggestionHighlightingOptions {
  /**
   * Delimiters for substrings that do not match the input
   */
  notMatchDelimiters?: OpenCloseDelimiters;

  /**
   * Delimiters for substrings that are exact match of the input
   */
  exactMatchDelimiters?: OpenCloseDelimiters;

  /**
   * Delimiters for substrings that are correction of the input
   */
  correctionDelimiters?: OpenCloseDelimiters;
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
 * Highlight a suggestion with the given delimiters.
 * @param suggestion The suggestion to highlight
 * @param options The object contaning the delimiters used
 */
export function getHighlightedSuggestions(
  suggestion: string,
  options: SuggestionHighlightingOptions
) {
  return suggestion.replace(
    /\[(.*?)\]|\{(.*?)\}|\((.*?)\)/g,
    (part, notMatched, matched, corrected) => {
      if (notMatched) {
        return suggestionWithDelimiters(notMatched, options.notMatchDelimiters);
      }
      if (matched) {
        return suggestionWithDelimiters(matched, options.exactMatchDelimiters);
      }
      if (corrected) {
        return suggestionWithDelimiters(
          corrected,
          options.correctionDelimiters
        );
      }

      return part;
    }
  );
}

function suggestionWithDelimiters(
  suggestion: string,
  delimiters: OpenCloseDelimiters | undefined
) {
  if (delimiters) {
    return delimiters.opening + suggestion + delimiters.closing;
  }
  return suggestion;
}
