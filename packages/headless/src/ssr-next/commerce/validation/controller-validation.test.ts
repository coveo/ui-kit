import {validateControllerNames} from './controller-validation.js';

describe('validateControllerNames', () => {
  it('should not throw an error for valid controller names', () => {
    const validControllers = {
      searchBox: {},
      productList: {},
      recommendations: {},
      facetManager: {},
    };

    expect(() => validateControllerNames(validControllers)).not.toThrow();
  });

  it('should throw an error when using reserved name "context"', () => {
    const controllersWithContext = {
      context: {},
      searchBox: {},
    };

    expect(() => validateControllerNames(controllersWithContext)).toThrow(
      'Reserved controller names found: context. Please use different controller names than context, cart, parameterManager.'
    );
  });

  it('should throw an error when using reserved name "cart"', () => {
    const controllersWithCart = {
      cart: {},
      productList: {},
    };

    expect(() => validateControllerNames(controllersWithCart)).toThrow(
      'Reserved controller names found: cart. Please use different controller names than context, cart, parameterManager.'
    );
  });

  it('should throw an error when using reserved name "parameterManager"', () => {
    const controllersWithParameterManager = {
      parameterManager: {},
      searchBox: {},
    };

    expect(() =>
      validateControllerNames(controllersWithParameterManager)
    ).toThrow(
      'Reserved controller names found: parameterManager. Please use different controller names than context, cart, parameterManager.'
    );
  });

  it('should handle empty controllers object', () => {
    const emptyControllers = {};

    expect(() => validateControllerNames(emptyControllers)).not.toThrow();
  });

  it('should work with controllers that have various value types', () => {
    const controllersWithDifferentValues = {
      searchBox: {config: 'value'},
      productList: null,
      recommendations: undefined,
      facetManager: {nested: {object: true}},
    };

    expect(() =>
      validateControllerNames(controllersWithDifferentValues)
    ).not.toThrow();
  });
});
