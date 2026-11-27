export interface TextSegment {
  text: string;
  match: boolean;
}

const WORD_START = String.raw`(?<![\p{L}\p{N}])`;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Splits `text` around every case-insensitive occurrence of the trimmed `query`, or only around
 * those that start a word.
 */
export function splitMatches(
  text: string,
  query: string,
  {wordStartsOnly = false}: {wordStartsOnly?: boolean} = {}
): TextSegment[] {
  const needle = query.trim();
  if (!needle) {
    return [{text, match: false}];
  }
  const pattern = new RegExp((wordStartsOnly ? WORD_START : '') + escapeRegExp(needle), 'giu');
  const segments: TextSegment[] = [];
  let start = 0;
  for (const {index, 0: found} of text.matchAll(pattern)) {
    if (index > start) {
      segments.push({text: text.slice(start, index), match: false});
    }
    segments.push({text: found, match: true});
    start = index + found.length;
  }
  if (start < text.length) {
    segments.push({text: text.slice(start), match: false});
  }
  return segments;
}
