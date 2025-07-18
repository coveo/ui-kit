import {isNullOrUndefined} from '@coveo/bueno';
import {isEmptyString} from './utils.js';

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

export interface Delimiters {
  /**
   * Opening delimiter
   */
  open: string;

  /**
   * Closing delimiter
   */
  close: string;
}

export interface SuggestionHighlightingOptions {
  /**
   * Delimiters for substrings that do not match the input
   */
  notMatchDelimiters?: Delimiters;

  /**
   * Delimiters for substrings that are exact match of the input
   */
  exactMatchDelimiters?: Delimiters;

  /**
   * Delimiters for substrings that are correction of the input
   */
  correctionDelimiters?: Delimiters;
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
  if (params.highlights.length === 0) {
    return escapeHtml(params.content);
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
    highlighted += escapeHtml(params.content.slice(last, start));
    highlighted += params.openingDelimiter;
    highlighted += escapeHtml(params.content.slice(start, end));
    highlighted += params.closingDelimiter;

    last = end;
  }
  if (last !== maxIndex) {
    highlighted += escapeHtml(params.content.slice(last));
  }
  return highlighted;
}

/**
 * Highlight a suggestion with the given delimiters.
 * @param suggestion The suggestion to highlight
 * @param options The object contaning the delimiters used
 */
export function getHighlightedSuggestion(
  suggestion: string,
  options: SuggestionHighlightingOptions
) {
  suggestion = escapeHtml(suggestion);
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
  delimiters: Delimiters | undefined
) {
  if (delimiters) {
    return delimiters.open + suggestion + delimiters.close;
  }
  return suggestion;
}

/**
 * Escapes a string. For more information, refer to {@link https://underscorejs.org/#escape}
 *
 * @param str The string to escape
 */

export function escapeHtml(str: string) {
  const mapOfCharToEscape: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
  };

  const source = `(?:${Object.keys(mapOfCharToEscape).join('|')})`;
  const testRegexp = RegExp(source);
  const replaceRegexp = RegExp(source, 'g');

  return testRegexp.test(str)
    ? str.replace(replaceRegexp, (substring) => mapOfCharToEscape[substring])
    : str;
}
