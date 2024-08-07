import {makeMatchConditions} from './product-template-common';

describe('makeMatchConditions', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
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
