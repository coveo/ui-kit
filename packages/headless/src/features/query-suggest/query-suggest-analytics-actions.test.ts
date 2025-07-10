import type {SearchAppState} from '../../state/search-app-state.js';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest.js';
import {buildMockQuerySuggestCompletion} from '../../test/mock-query-suggest-completion.js';
import {createMockState} from '../../test/mock-state.js';
import {buildOmniboxSuggestionMetadata} from './query-suggest-analytics-actions.js';

describe('#buildOmniboxSuggestionMetadata', () => {
  const id = '1';
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('given an invalid query suggest id, it throws', () => {
    expect(() =>
      buildOmniboxSuggestionMetadata(state, {id, suggestion: ''})
    ).toThrow();
  });

  it('given a valid id, it includes the query suggest expressions in the payload', () => {
    state.querySuggest[id] = buildMockQuerySuggest({
      completions: [buildMockQuerySuggestCompletion({expression: 'a'})],
    });

    const {suggestions} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: '',
    });
    expect(suggestions).toEqual(['a']);
  });

  it('given two partial queries, it returns the last partial query as the #partialQuery', () => {
    state.querySuggest[id] = buildMockQuerySuggest({
      partialQueries: ['a', 'b'],
    });
    const {partialQuery} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: '',
    });
    expect(partialQuery).toBe('b');
  });

  it('given no partial queries, it returns an empty string as the #partialQuery', () => {
    state.querySuggest[id] = buildMockQuerySuggest({partialQueries: []});
    const {partialQuery} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: '',
    });
    expect(partialQuery).toBe('');
  });

  it('returns all partial queries in the #partialQueries property', () => {
    const partialQueries = ['a', 'b'];
    state.querySuggest[id] = buildMockQuerySuggest({partialQueries});
    const data = buildOmniboxSuggestionMetadata(state, {id, suggestion: ''});

    expect(data.partialQueries).toEqual(partialQueries);
  });

  it('when the passed suggestion is found, it returns the index in #suggestionRanking', () => {
    const completionA = buildMockQuerySuggestCompletion({expression: 'a'});
    const completionB = buildMockQuerySuggestCompletion({expression: 'b'});

    state.querySuggest[id] = buildMockQuerySuggest({
      completions: [completionA, completionB],
    });

    const {suggestionRanking} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: 'b',
    });
    expect(suggestionRanking).toBe(1);
  });

  it('when the passed suggestion is not found, it returns -1 in #suggestionRanking', () => {
    state.querySuggest[id] = buildMockQuerySuggest({completions: []});

    const {suggestionRanking} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: 'a',
    });
    expect(suggestionRanking).toBe(-1);
  });

  it('returns the response id in #querySuggestResponseId', () => {
    const responseId = 'response-uuid';
    state.querySuggest[id] = buildMockQuerySuggest({responseId});

    const {querySuggestResponseId} = buildOmniboxSuggestionMetadata(state, {
      id,
      suggestion: '',
    });
    expect(querySuggestResponseId).toBe(responseId);
  });
});
