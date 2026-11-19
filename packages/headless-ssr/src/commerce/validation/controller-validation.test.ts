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

  it.each(['context', 'cart', 'parameterManager'])(
    'should throw an error when using the reserved name "%s"',
    (reservedName) => {
      expect(() => validateControllerNames({[reservedName]: {}, searchBox: {}})).toThrow(
        `Reserved controller names found: ${reservedName}.`
      );
    }
  );

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
