import {
  registerQuerySuggest,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  selectQuerySuggestion,
  unregisterQuerySuggest,
  fetchQuerySuggestions,
} from './query-suggest-actions';

describe('querySuggest actions', () => {
  it(`when calling registerQuerySuggest with an invalid count
  it should throw`, () => {
    expect(() => registerQuerySuggest({id: '1', count: -3})).toThrow();
  });

  it(`when calling registerQuerySuggest with an undefined id
  it should throw`, () => {
    expect(() =>
      registerQuerySuggest({id: (undefined as unknown) as string})
    ).toThrow();
  });

  it(`when calling clearQuerySuggest with an undefined id
  it should throw`, () => {
    expect(() =>
      clearQuerySuggest({id: (undefined as unknown) as string})
    ).toThrow();
  });

  it(`when calling clearQuerySuggestCompletions with an undefined id
  it should throw`, () => {
    expect(() =>
      clearQuerySuggestCompletions({id: (undefined as unknown) as string})
    ).toThrow();
  });

  it(`when calling selectQuerySuggestion with an undefined id
  it should throw`, () => {
    expect(() =>
      selectQuerySuggestion({
        id: (undefined as unknown) as string,
        expression: 'allo',
      })
    ).toThrow();
  });

  it(`when calling selectQuerySuggestion with an undefined expression
  it should throw`, () => {
    expect(() =>
      selectQuerySuggestion({
        id: '123',
        expression: (undefined as unknown) as string,
      })
    ).toThrow();
  });

  it(`when calling unregisterQuerySuggest with an undefined id
  it should throw`, () => {
    expect(() =>
      unregisterQuerySuggest({id: (undefined as unknown) as string})
    ).toThrow();
  });

  it(`when calling fetchQuerySuggestions with an undefined id
  it should reject`, async (done) => {
    const action = await fetchQuerySuggestions({
      id: (undefined as unknown) as string,
    })(
      () => {},
      () => {},
      null
    );
    expect(action.type).toBe(fetchQuerySuggestions.rejected.type);
    done();
  });
});
