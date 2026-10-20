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
      'Reserved controller names found: context. The context, cart, parameterManager controllers are included automatically in every engine definition; use different names for your own controllers.'
    );
  });

  it('should throw an error when using reserved name "cart"', () => {
    const controllersWithCart = {
      cart: {},
      productList: {},
    };

    expect(() => validateControllerNames(controllersWithCart)).toThrow(
      'Reserved controller names found: cart. The context, cart, parameterManager controllers are included automatically in every engine definition; use different names for your own controllers.'
    );
  });

  it('should throw an error when using reserved name "parameterManager"', () => {
    const controllersWithParameterManager = {
      parameterManager: {},
      searchBox: {},
    };

    expect(() => validateControllerNames(controllersWithParameterManager)).toThrow(
      'Reserved controller names found: parameterManager. The context, cart, parameterManager controllers are included automatically in every engine definition; use different names for your own controllers.'
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

    expect(() => validateControllerNames(controllersWithDifferentValues)).not.toThrow();
  });
});
