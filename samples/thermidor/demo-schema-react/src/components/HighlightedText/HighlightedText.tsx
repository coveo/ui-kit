import {Fragment} from 'react';
import {splitMatches} from './split-matches.js';

interface HighlightedTextProps {
  text: string;
  query: string;
  wordStartsOnly?: boolean;
}

/** Draws `text` with every occurrence of `query` in bold, or only those that start a word. */
export function HighlightedText({text, query, wordStartsOnly}: HighlightedTextProps) {
  return splitMatches(text, query, {wordStartsOnly}).map(({text: segment, match}, index) => (
    <Fragment key={index}>{match ? <strong>{segment}</strong> : segment}</Fragment>
  ));
}
