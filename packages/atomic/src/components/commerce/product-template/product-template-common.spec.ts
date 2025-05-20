import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  MockInstance,
} from 'vitest';
import {makeMatchConditions} from './product-template-common';

vi.mock('coveo/headless/commerce');

describe('makeMatchConditions', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log a warning and return an always-false callback', () => {
    const conditions = makeMatchConditions(
      {field: ['value']},
      {field: ['value']}
    );
    expect(conditions).toHaveLength(1);
    expect(conditions[0]).toBeInstanceOf(Function);
    expect(conditions[0].toString()).toMatchSnapshot();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0]).toMatchSnapshot();
  });
});
