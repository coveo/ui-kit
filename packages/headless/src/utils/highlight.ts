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

type HighlightKeywordOrString = HighlightKeyword | string;

export interface HighlightParams {
  /**
   * The string to highlight items in.
   */
  content: string;
  /**
   * The highlighted positions to highlight in the string.
   */
  highlights: HighlightKeywordOrString[];
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
  if (
    params.highlights.every(
      (highlighKeyword: HighlightKeywordOrString) =>
        typeof highlighKeyword === 'string'
    )
  ) {
    params.highlights = highlightKeywordString(params.highlights as string[]);
  }
  const maxIndex = params.content.length;
  let highlighted = '';
  let last = 0;
  for (let i = 0; i < params.highlights.length; i++) {
    const highlight = params.highlights[i] as HighlightKeyword;
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
 * Cast the parameter to an array of HighlightKeywords to be used in the 'highlightString' function.
 * @param highlightKeywords The highlights keywords as an array of string. This should be was is returned by the API
 */
export function highlightKeywordString(
  highlightKeywords: string[]
): HighlightKeyword[] {
  return highlightKeywords.map(
    (keyword): HighlightKeyword => {
      return (keyword as unknown) as HighlightKeyword;
    }
  );
}
