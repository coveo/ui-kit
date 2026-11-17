import {describe, expect, it} from 'vitest';
import {splitMatches} from './split-matches.js';

describe('splitMatches', () => {
  it('marks every occurrence of the query, ignoring case', () => {
    expect(splitMatches('Surf wax for surfboards', 'SURF')).toEqual([
      {text: 'Surf', match: true},
      {text: ' wax for ', match: false},
      {text: 'surf', match: true},
      {text: 'boards', match: false},
    ]);
  });

  it('marks occurrences inside words', () => {
    expect(splitMatches('Snowshoes', 'shoe')).toEqual([
      {text: 'Snow', match: false},
      {text: 'shoe', match: true},
      {text: 's', match: false},
    ]);
  });

  it('marks only occurrences that start a word when asked', () => {
    expect(
      splitMatches('Kayak and sea kayaks, not in-kayak', 'kayak', {wordStartsOnly: true})
    ).toEqual([
      {text: 'Kayak', match: true},
      {text: ' and sea ', match: false},
      {text: 'kayak', match: true},
      {text: 's, not in-', match: false},
      {text: 'kayak', match: true},
    ]);
    expect(splitMatches('Snowshoes', 'shoe', {wordStartsOnly: true})).toEqual([
      {text: 'Snowshoes', match: false},
    ]);
  });

  it('keeps matches aligned when lower-casing changes the length of the text', () => {
    const expected = [
      {text: 'İstanbul ', match: false},
      {text: 'surf', match: true},
      {text: 'board', match: false},
    ];
    expect(splitMatches('İstanbul surfboard', 'surf')).toEqual(expected);
    expect(splitMatches('İstanbul surfboard', 'surf', {wordStartsOnly: true})).toEqual(expected);
  });

  it('trims the query', () => {
    expect(splitMatches('kayaks', ' kay ')).toEqual([
      {text: 'kay', match: true},
      {text: 'aks', match: false},
    ]);
  });

  it('marks nothing for a blank query or one the text does not contain', () => {
    expect(splitMatches('kayaks', '  ')).toEqual([{text: 'kayaks', match: false}]);
    expect(splitMatches('kayaks', 'paddle')).toEqual([{text: 'kayaks', match: false}]);
  });

  it('treats the query as literal text', () => {
    expect(splitMatches('a.b and axb', 'a.b')).toEqual([
      {text: 'a.b', match: true},
      {text: ' and axb', match: false},
    ]);
  });
});
