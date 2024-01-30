import {searchReducer as search} from '../../features/search/search-slice';
import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {buildQueryError} from './headless-query-error';

describe('query error', () => {
  it('it adds the correct reducers to engine', () => {
    const e = buildMockSearchAppEngine();
    buildQueryError(e);

    expect(e.addReducers).toHaveBeenCalledWith({search});
  });

  it('should expose proper state for #hasError when there is no error', () => {
    const e = buildMockSearchAppEngine();
    e.state.search.error = null;
    expect(buildQueryError(e).state.hasError).toBe(false);
  });

  it('should expose proper state for #hasError when there is an error', () => {
    const e = buildMockSearchAppEngine();
    e.state.search.error = {
      message: 'oh no',
      statusCode: 500,
      type: 'pretty bad',
    };
    expect(buildQueryError(e).state.hasError).toBe(true);
  });
});
