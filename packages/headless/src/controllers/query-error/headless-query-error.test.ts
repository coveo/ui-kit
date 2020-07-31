import {buildQueryError} from './headless-query-error';
import {buildMockEngine} from '../../test';

describe('query error', () => {
  it('should expose proper state for #hasError when there is no error', () => {
    const e = buildMockEngine();
    e.state.search.error = null;
    expect(buildQueryError(e).state.hasError).toBe(false);
  });

  it('should expose proper state for #hasError when there is an error', () => {
    const e = buildMockEngine();
    e.state.search.error = {
      message: 'oh no',
      statusCode: 500,
      type: 'pretty bad',
    };
    expect(buildQueryError(e).state.hasError).toBe(true);
  });
});
